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

export const communitiesRouter = Router();

const communityBody = z.object({
  name: z.string().min(2).max(120),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  story: z.string().min(20),
  mission: z.string().min(10),
  coordinatorId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED")
});

communitiesRouter.get(
  "/",
  validate({ query: paginationQuery }),
  asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
    };

    const where = {
      status: "PUBLISHED" as const,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { story: { contains: search, mode: "insensitive" as const } },
              { mission: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          coordinator: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { members: true, events: true, announcements: true } }
        }
      }),
      prisma.community.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

communitiesRouter.get(
  "/:slug",
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        coordinator: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        events: { orderBy: { startAt: "asc" }, take: 6 },
        announcements: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 6 },
        galleryItems: true
      }
    });

    if (!community) throw notFound("Communaute introuvable");
    res.json({ community });
  })
);

communitiesRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur"]),
  validate({ body: communityBody }),
  asyncHandler(async (req, res) => {
    const community = await prisma.community.create({
      data: {
        ...req.body,
        name: sanitizeText(req.body.name),
        story: sanitizeText(req.body.story),
        mission: sanitizeText(req.body.mission),
        slug: uniqueSlug(req.body.name)
      }
    });
    await audit(req, "community.create", "Community", community.id);
    res.status(201).json({ community });
  })
);

communitiesRouter.post(
  "/:id/join",
  requireAuth,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const { id } = req.params as { id: string };
    const membership = await prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: id, userId: authed.user!.id } },
      update: {},
      create: { communityId: id, userId: authed.user!.id }
    });

    res.status(201).json({ membership });
  })
);
