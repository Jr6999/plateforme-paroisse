import { existsSync, mkdirSync, unlinkSync } from "node:fs";
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

const ensureUploadsDirectory = () => {
  if (!existsSync(uploadsDirectory)) mkdirSync(uploadsDirectory, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureUploadsDirectory();
    callback(null, uploadsDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = toSlug(path.basename(file.originalname, extension)) || "document";
    callback(null, `${basename}-${Date.now().toString(36)}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new HttpError(415, "Type de fichier non autorise"));
    }
    callback(null, true);
  }
});

const uploadBody = z.object({
  title: z.string().min(2).max(180).optional(),
  entityType: z.string().min(2).max(80).optional(),
  entityId: z.string().min(1).optional(),
  announcementId: z.string().min(1).optional()
});

uploadsRouter.get(
  "/",
  requireAuth,
  validate({ query: paginationQuery.extend({ entityType: z.string().optional(), entityId: z.string().optional() }) }),
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
    const document = await prisma.document.create({
      data: {
        title: body.title ?? req.file.originalname,
        url: `${env.API_URL}/uploads/${req.file.filename}`,
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
      filename: req.file.filename,
      mimeType: req.file.mimetype
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

    // Protection path traversal : ne supprimer que dans le répertoire uploads
    try {
      const filename = path.basename(new URL(document.url).pathname);
      // Validation stricte du nom de fichier (alphanum, tirets, underscores, point)
      if (/^[\w\-.]+$/.test(filename)) {
        const localPath = path.resolve(uploadsDirectory, filename);
        // Vérification que le chemin résolu est bien dans uploadsDirectory
        if (localPath.startsWith(path.resolve(uploadsDirectory) + path.sep) && existsSync(localPath)) {
          unlinkSync(localPath);
        }
      }
    } catch { /* Le fichier distant (Cloudinary, etc.) n'est pas supprimé ici */ }

    await audit(req, "document.delete", "Document", document.id);
    res.status(204).send();
  })
);
