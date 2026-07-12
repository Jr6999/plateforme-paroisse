import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, type AuthedRequest } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.use(requireRoles(["administrateur", "catechiste"]));

attendanceRouter.post(
  "/",
  validate({
    body: z.object({
      catechumenId: z.string().min(1),
      kind: z.string().min(2).max(80),
      status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]).default("PRESENT"),
      attendedAt: z.coerce.date(),
      note: z.string().max(500).optional(),
      eventId: z.string().optional(),
      sacredRhythmId: z.string().optional()
    })
  }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const attendance = await prisma.attendance.create({
      data: {
        ...req.body,
        recordedById: authed.user!.id
      }
    });
    await audit(req, "attendance.create", "Attendance", attendance.id);
    res.status(201).json({ attendance });
  })
);

attendanceRouter.get(
  "/reports/monthly",
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const rows = await prisma.attendance.findMany({
      where: { attendedAt: { gte: since } },
      select: { status: true, kind: true, attendedAt: true }
    });

    res.json({
      items: rows.map((row) => ({
        month: row.attendedAt.toISOString().slice(0, 7),
        status: row.status,
        kind: row.kind
      }))
    });
  })
);
