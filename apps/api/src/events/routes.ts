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

export const eventsRouter = Router();

const eventBody = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(20),
  status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  location: z.string().min(2).max(180),
  coverImageUrl: z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
  registrationUrl: z.string().url().optional(),
  livestreamUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  communityId: z.string().optional()
}).refine(
  (data) => !data.endAt || data.endAt > data.startAt,
  { message: "La date de fin doit être postérieure à la date de début", path: ["endAt"] }
);

eventsRouter.get(
  "/",
  validate({
    query: paginationQuery.extend({
      status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional()
    })
  }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, status, from, to } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      status?: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
      from?: Date;
      to?: Date;
    };

    const where = {
      ...(status ? { status } : {}),
      ...(from || to ? { startAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { location: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startAt: "asc" },
        include: {
          category: true,
          community: { select: { id: true, name: true, slug: true } },
          _count: { select: { registrations: true, attendance: true } }
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({ items, meta: pageMeta(page, limit, total) });
  })
);

eventsRouter.get(
  "/:slug",
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        category: true,
        community: true,
        galleryItems: true,
        registrations: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    if (!event) throw notFound("Evenement introuvable");
    res.json({ event });
  })
);

eventsRouter.post(
  "/",
  requireAuth,
  requireRoles(["administrateur", "responsable_communautaire"]),
  validate({ body: eventBody }),
  asyncHandler(async (req, res) => {
    const event = await prisma.event.create({
      data: {
        ...req.body,
        title: sanitizeText(req.body.title),
        description: sanitizeText(req.body.description),
        location: sanitizeText(req.body.location),
        slug: uniqueSlug(req.body.title)
      }
    });
    await audit(req, "event.create", "Event", event.id);
    res.status(201).json({ event });
  })
);

eventsRouter.post(
  "/:id/register",
  requireAuth,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ guests: z.number().int().min(0).default(0), note: z.string().max(400).optional() })
  }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const { id } = req.params as { id: string };
    const registration = await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: id, userId: authed.user!.id } },
      update: { guests: req.body.guests, note: req.body.note },
      create: {
        eventId: id,
        userId: authed.user!.id,
        guests: req.body.guests,
        note: req.body.note
      }
    });

    res.status(201).json({ registration });
  })
);

eventsRouter.patch(
  "/:id",
  requireAuth,
  requireRoles(["administrateur", "responsable_communautaire"]),
  validate({ params: z.object({ id: z.string().min(1) }), body: eventBody.partial() }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const data = { ...req.body };
    if (data.title) {
      data.title = sanitizeText(data.title);
      // Regénère le slug uniquement si le titre change
      data.slug = uniqueSlug(data.title);
    }
    if (data.description) data.description = sanitizeText(data.description);
    if (data.location) data.location = sanitizeText(data.location);

    const event = await prisma.event.update({ where: { id }, data });
    await audit(req, "event.update", "Event", event.id);
    res.json({ event });
  })
);
