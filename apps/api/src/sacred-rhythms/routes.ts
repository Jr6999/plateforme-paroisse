import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { sanitizeText, uniqueSlug } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const sacredRhythmsRouter = Router();

const rhythmBody = z.object({
  title: z.string().min(3).max(180),
  theme: z.string().min(3).max(180),
  description: z.string().min(20),
  level: z.string().min(2).max(80),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  location: z.string().max(180).optional(),
  instructorId: z.string().optional(),
  lessons: z
    .array(
      z.object({
        title: z.string().min(3).max(180),
        content: z.string().min(10),
        position: z.number().int().min(1),
        resourcesUrl: z.string().url().optional()
      })
    )
    .default([])
});

sacredRhythmsRouter.get(
  "/",
  validate({ query: paginationQuery.extend({ level: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, level } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      level?: string;
    };
    const where = {
      ...(level ? { level } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { theme: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.sacredRhythm.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startAt: "asc" },
        include: {
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          lessons: { orderBy: { position: "asc" } },
          _count: { select: { attendance: true } }
        }
      }),
      prisma.sacredRhythm.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

sacredRhythmsRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur", "catechiste"]),
  validate({ body: rhythmBody }),
  asyncHandler(async (req, res) => {
    const rhythm = await prisma.sacredRhythm.create({
      data: {
        title: sanitizeText(req.body.title),
        slug: uniqueSlug(req.body.title),
        theme: sanitizeText(req.body.theme),
        description: sanitizeText(req.body.description),
        level: req.body.level,
        startAt: req.body.startAt,
        endAt: req.body.endAt,
        location: req.body.location,
        instructorId: req.body.instructorId,
        lessons: {
          create: req.body.lessons.map((lesson: { title: string; content: string; position: number; resourcesUrl?: string }) => ({
            title: sanitizeText(lesson.title),
            content: sanitizeText(lesson.content),
            position: lesson.position,
            resourcesUrl: lesson.resourcesUrl
          }))
        }
      },
      include: { lessons: true }
    });

    await audit(req, "sacred_rhythm.create", "SacredRhythm", rhythm.id);
    res.status(201).json({ rhythm });
  })
);
