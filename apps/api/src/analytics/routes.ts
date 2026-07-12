import { Router } from "express";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { prisma } from "../prisma/client.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.use(requireRoles(["administrateur", "catechiste", "responsable_communautaire"]));

analyticsRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [
      users,
      announcements,
      events,
      upcomingEvents,
      communities,
      catechumens,
      recentAudit,
      attendanceStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.announcement.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count(),
      prisma.event.count({ where: { startAt: { gte: now, lte: nextMonth } } }),
      prisma.community.count({ where: { status: "PUBLISHED" } }),
      prisma.catechumen.count({ where: { status: "ACTIVE" } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
          // IpAddress exclue intentionnellement pour ne pas exposer les données sensibles
          user: { select: { id: true, name: true } }
        }
      }),
      prisma.attendance.groupBy({ by: ["status"], _count: true })
    ]);

    res.json({
      stats: {
        users,
        announcements,
        events,
        upcomingEvents,
        communities,
        catechumens
      },
      attendanceStats,
      recentAudit
    });
  })
);
