import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../auth/middleware.js";
import { asyncHandler } from "../common/async-handler.js";
import { pageMeta, paginationQuery } from "../common/pagination.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
  "/",
  requireRoles(["administrateur"]),
  validate({ query: paginationQuery.extend({ role: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, role } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      role?: string;
    };

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {}),
      ...(role
        ? {
            roles: {
              some: {
                role: { key: role }
              }
            }
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          roles: { include: { role: true } }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      items: items.map((user) => ({
        ...user,
        roles: user.roles.map((membership) => membership.role)
      })),
      meta: pageMeta(page, limit, total)
    });
  })
);

usersRouter.patch(
  "/:id/status",
  requireRoles(["administrateur"]),
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "ARCHIVED"]) })
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const user = await prisma.user.update({
      where: { id },
      data: { status: req.body.status },
      select: { id: true, email: true, name: true, status: true }
    });

    res.json({ user });
  })
);
