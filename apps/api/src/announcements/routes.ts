import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, type AuthedRequest } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { notFound } from "../common/http-error.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { sanitizeText, uniqueSlug } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const announcementsRouter = Router();

const announcementBody = z.object({
  title: z.string().min(3).max(180),
  excerpt: z.string().min(10).max(320),
  content: z.string().min(20),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().max(40)).default([]),
  communityId: z.string().optional(),
  isPinned: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED")
});

const listQuery = paginationQuery.extend({
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
});

announcementsRouter.get(
  "/",
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, category, status } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      category?: string;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    };

    const where = {
      status: status ?? "PUBLISHED",
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { excerpt: { contains: search, mode: "insensitive" as const } },
              { content: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          community: { select: { id: true, name: true, slug: true, logoUrl: true } },
          _count: { select: { comments: true, reactions: true } }
        }
      }),
      prisma.announcement.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

announcementsRouter.get(
  "/:slug",
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const announcement = await prisma.announcement.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        community: { select: { id: true, name: true, slug: true } },
        documents: true,
        comments: {
          where: { parentId: null, status: "PUBLISHED" },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: { include: { author: { select: { id: true, name: true, avatarUrl: true } } } }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: { select: { reactions: true } }
      }
    });

    if (!announcement || announcement.status === "ARCHIVED") throw notFound("Annonce introuvable");
    res.json({ announcement });
  })
);

announcementsRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur", "responsable_communautaire"]),
  validate({ body: announcementBody }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const announcement = await prisma.announcement.create({
      data: {
        title: sanitizeText(req.body.title),
        slug: uniqueSlug(req.body.title),
        excerpt: sanitizeText(req.body.excerpt),
        content: sanitizeText(req.body.content),
        category: sanitizeText(req.body.category),
        tags: req.body.tags,
        isPinned: req.body.isPinned,
        status: req.body.status,
        publishedAt: req.body.status === "PUBLISHED" ? new Date() : null,
        authorId: authed.user!.id,
        communityId: req.body.communityId
      }
    });

    await audit(req, "announcement.create", "Announcement", announcement.id);
    res.status(201).json({ announcement });
  })
);

announcementsRouter.patch(
  "/:id",
  requireAuth,
  requireRoles(["administrateur", "responsable_communautaire"]),
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: announcementBody.partial()
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    // Vérification d'existence — retourne 404 au lieu de 500
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw notFound("Annonce introuvable");

    const data = {
      ...req.body,
      ...(req.body.title ? { title: sanitizeText(req.body.title) } : {}),
      ...(req.body.excerpt ? { excerpt: sanitizeText(req.body.excerpt) } : {}),
      ...(req.body.content ? { content: sanitizeText(req.body.content) } : {}),
      ...(req.body.status === "PUBLISHED" ? { publishedAt: new Date() } : {})
    };

    const announcement = await prisma.announcement.update({
      where: { id },
      data
    });

    await audit(req, "announcement.update", "Announcement", announcement.id);
    res.json({ announcement });
  })
);

announcementsRouter.delete(
  "/:id",
  requireAuth,
  requireRoles(["administrateur"]),
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    await prisma.announcement.update({
      where: { id },
      data: { status: "ARCHIVED" }
    });
    await audit(req, "announcement.archive", "Announcement", id);
    res.status(204).send();
  })
);
