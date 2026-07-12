import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { sanitizeText, uniqueSlug } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const historyRouter = Router();

const historyBody = z.object({
  title: z.string().min(3).max(180),
  period: z.string().max(120).optional(),
  occurredAt: z.coerce.date().optional(),
  description: z.string().min(20),
  mediaUrl: z.string().url().optional(),
  documentUrl: z.string().url().optional(),
  type: z.string().default("archive"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED")
});

historyRouter.get(
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
              { title: { contains: search, mode: "insensitive" as const } },
              { period: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.parishHistory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }]
      }),
      prisma.parishHistory.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

historyRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur"]),
  validate({ body: historyBody }),
  asyncHandler(async (req, res) => {
    const history = await prisma.parishHistory.create({
      data: {
        ...req.body,
        title: sanitizeText(req.body.title),
        description: sanitizeText(req.body.description),
        slug: uniqueSlug(req.body.title)
      }
    });
    await audit(req, "history.create", "ParishHistory", history.id);
    res.status(201).json({ history });
  })
);
