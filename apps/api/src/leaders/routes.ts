import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { sanitizeText, uniqueSlug } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const leadersRouter = Router();

const leaderBody = z.object({
  name: z.string().min(3).max(120),
  title: z.string().min(2).max(120),
  roleType: z.string().min(2).max(80),
  photoUrl: z.string().url().optional(),
  biography: z.string().min(20),
  serviceStart: z.coerce.date().optional(),
  serviceEnd: z.coerce.date().optional(),
  accomplishments: z.array(z.string()).default([]),
  quotes: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  sortOrder: z.number().int().default(0)
});

leadersRouter.get(
  "/",
  validate({ query: paginationQuery.extend({ roleType: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, roleType } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      roleType?: string;
    };
    const where = {
      status: "PUBLISHED" as const,
      ...(roleType ? { roleType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } },
              { biography: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.leader.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { serviceStart: "desc" }]
      }),
      prisma.leader.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

leadersRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur"]),
  validate({ body: leaderBody }),
  asyncHandler(async (req, res) => {
    const leader = await prisma.leader.create({
      data: {
        ...req.body,
        name: sanitizeText(req.body.name),
        title: sanitizeText(req.body.title),
        biography: sanitizeText(req.body.biography),
        slug: uniqueSlug(req.body.name)
      }
    });
    await audit(req, "leader.create", "Leader", leader.id);
    res.status(201).json({ leader });
  })
);
