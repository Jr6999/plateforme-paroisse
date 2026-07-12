import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { sanitizeText } from "../common/sanitize.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const commentsRouter = Router();

commentsRouter.post(
  "/",
  requireAuth,
  validate({
    body: z.object({
      announcementId: z.string().min(1),
      parentId: z.string().optional(),
      content: z.string().min(2).max(2000)
    })
  }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const comment = await prisma.comment.create({
      data: {
        announcementId: req.body.announcementId,
        parentId: req.body.parentId,
        content: sanitizeText(req.body.content),
        authorId: authed.user!.id
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } }
    });

    await audit(req, "comment.create", "Comment", comment.id, {
      announcementId: req.body.announcementId
    });
    res.status(201).json({ comment });
  })
);

commentsRouter.post(
  "/:id/reactions",
  requireAuth,
  validate({ params: z.object({ id: z.string().min(1) }), body: z.object({ type: z.string().default("LIKE") }) }),
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    const { id } = req.params as { id: string };
    const reaction = await prisma.reaction.upsert({
      where: {
        unique_user_comment_reaction: {
          userId: authed.user!.id,
          commentId: id,
          type: req.body.type
        }
      },
      update: {},
      create: {
        userId: authed.user!.id,
        commentId: id,
        type: req.body.type
      }
    });

    res.status(201).json({ reaction });
  })
);
