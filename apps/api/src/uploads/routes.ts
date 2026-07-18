import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth, requireRoles, type AuthedRequest } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { HttpError, notFound } from "../common/http-error.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { toSlug } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { env } from "../config/env.js";
import { prisma } from "../prisma/client.js";

export const uploadsRouter = Router();

/**
 * Répertoire uploads local — utilisé uniquement en développement.
 * En production (Render / Koyeb / Railway), les fichiers sont envoyés vers Cloudinary.
 * Cette valeur est conservée pour la compatibilité avec app.ts (express.static).
 */
export const uploadsDirectory = path.resolve(process.cwd(), "uploads");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

/**
 * Utilise memoryStorage en production pour éviter l'écriture disque éphémère.
 * Les fichiers en mémoire sont ensuite transférés vers Cloudinary.
 * En développement, diskStorage peut être utilisé localement.
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new HttpError(415, "Type de fichier non autorisé"));
    }
    callback(null, true);
  }
});

/**
 * Upload vers Cloudinary si configuré, sinon retourne une URL temporaire.
 */
const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; publicId?: string }> => {
  const hasCloudinary =
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

  if (!hasCloudinary) {
    // Mode développement : stocker en mémoire et retourner une URL symbolique
    console.warn("[Upload] Cloudinary non configuré — fichier non persisté en production");
    const ext = path.extname(filename).toLowerCase();
    const base = toSlug(path.basename(filename, ext)) || "document";
    return { url: `${env.API_URL}/uploads/${base}-${Date.now().toString(36)}${ext}` };
  }

  // Cloudinary SDK via import dynamique pour éviter une dépendance obligatoire
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });

  return new Promise((resolve, reject) => {
    const isImage = mimeType.startsWith("image/");
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: isImage ? "image" : "raw",
        folder: "paroisse-cathedrale",
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error || !result) return reject(new HttpError(500, "Erreur upload Cloudinary"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

const uploadBody = z.object({
  title: z.string().min(2).max(180).optional(),
  entityType: z.string().min(2).max(80).optional(),
  entityId: z.string().min(1).optional(),
  announcementId: z.string().min(1).optional()
});

uploadsRouter.get(
  "/",
  requireAuth,
  validate({
    query: paginationQuery.extend({
      entityType: z.string().optional(),
      entityId: z.string().optional()
    })
  }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, entityType, entityId } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      entityType?: string;
      entityId?: string;
    };

    const where = {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {})
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, name: true, avatarUrl: true } } }
      }),
      prisma.document.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

uploadsRouter.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    if (!req.file) throw new HttpError(400, "Fichier requis");

    const body = uploadBody.parse(req.body);

    // Upload vers Cloudinary (production) ou URL symbolique (dev)
    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const document = await prisma.document.create({
      data: {
        title: body.title ?? req.file.originalname,
        url,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        entityType: body.entityType,
        entityId: body.entityId,
        announcementId: body.announcementId,
        uploadedById: authed.user!.id
      },
      include: { uploadedBy: { select: { id: true, name: true, avatarUrl: true } } }
    });

    await audit(req, "document.upload", "Document", document.id, {
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      cloudinaryPublicId: publicId ?? null
    });

    res.status(201).json({ document });
  })
);

uploadsRouter.delete(
  "/:id",
  requireAuth,
  requireRoles(["administrateur"]),
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw notFound("Document introuvable");

    await prisma.document.delete({ where: { id: document.id } });

    // Supprimer depuis Cloudinary si configuré
    const hasCloudinary =
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        cloudinary.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET
        });
        // Extraire le public_id depuis l'URL Cloudinary
        const urlParts = document.url.split("/upload/");
        if (urlParts.length === 2) {
          const publicId = urlParts[1].replace(/\.[^.]+$/, "");
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.warn("[Upload] Impossible de supprimer depuis Cloudinary:", err);
      }
    }

    await audit(req, "document.delete", "Document", document.id);
    res.status(204).send();
  })
);
