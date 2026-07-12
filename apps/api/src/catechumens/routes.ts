import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { HttpError } from "../common/http-error.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { sanitizeText } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const catechumensRouter = Router();

catechumensRouter.use(requireAuth);
catechumensRouter.use(requireRoles(["administrateur", "catechiste"]));

const catechumenBody = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  sex: z.string().min(1).max(30),
  birthDate: z.coerce.date().optional(),
  photoUrl: z.string().url().optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(240).optional(),
  level: z.string().min(2).max(80),
  progression: z.number().int().min(0).max(100).default(0),
  guardianName: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
  responsibleId: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).default("ACTIVE")
});

catechumensRouter.get(
  "/",
  validate({
    query: paginationQuery.extend({
      level: z.string().optional(),
      status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional()
    })
  }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, level, status } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      level?: string;
      status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
    };

    const where = {
      ...(level ? { level } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.catechumen.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          responsible: { select: { id: true, name: true } },
          sacraments: true,
          attendance: { orderBy: { attendedAt: "desc" }, take: 5 }
        }
      }),
      prisma.catechumen.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

catechumensRouter.get(
  "/stats/summary",
  asyncHandler(async (_req, res) => {
    const [total, active, completed, attendance] = await Promise.all([
      prisma.catechumen.count(),
      prisma.catechumen.count({ where: { status: "ACTIVE" } }),
      prisma.catechumen.count({ where: { status: "COMPLETED" } }),
      prisma.attendance.groupBy({
        by: ["status"],
        _count: true,
        where: {
          attendedAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const present = attendance.find((item) => item.status === "PRESENT")?._count ?? 0;
    const all = attendance.reduce((sum, item) => sum + item._count, 0);

    res.json({
      total,
      active,
      completed,
      presenceRate: all ? Math.round((present / all) * 100) : 0,
      attendance
    });
  })
);

catechumensRouter.post(
  "/",
  validate({ body: catechumenBody }),
  asyncHandler(async (req, res) => {
    const catechumen = await prisma.catechumen.create({
      data: {
        ...req.body,
        firstName: sanitizeText(req.body.firstName),
        lastName: sanitizeText(req.body.lastName),
        address: req.body.address ? sanitizeText(req.body.address) : undefined,
        notes: req.body.notes ? sanitizeText(req.body.notes) : undefined
      }
    });
    await audit(req, "catechumen.create", "Catechumen", catechumen.id);
    res.status(201).json({ catechumen });
  })
);

catechumensRouter.patch(
  "/:id",
  validate({ params: z.object({ id: z.string().min(1) }), body: catechumenBody.partial() }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    // Vérification d'existence préalable pour retourner 404 et non 500
    const existing = await prisma.catechumen.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Catéchumène introuvable");

    const catechumen = await prisma.catechumen.update({
      where: { id },
      data: req.body
    });
    await audit(req, "catechumen.update", "Catechumen", catechumen.id);
    res.json({ catechumen });
  })
);
