import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const notifications = await prisma.notification.findMany({
      where: { userId: authed.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json({ items: notifications });
  })
);

notificationsRouter.patch(
  "/:id/read",
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const { id } = req.params as { id: string };
    await prisma.notification.updateMany({
      where: { id, userId: authed.user!.id },
      data: { readAt: new Date() }
    });
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    res.json({ notification });
  })
);
