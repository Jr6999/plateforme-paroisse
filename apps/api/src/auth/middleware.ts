import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../common/http-error.js";
import { prisma } from "../prisma/client.js";
import { verifyAccessToken } from "./tokens.js";

export type RequestUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

export type AuthedRequest = Request & {
  user?: RequestUser;
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw new HttpError(401, "Authentification requise");

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.status !== "ACTIVE") throw new HttpError(401, "Utilisateur invalide");

    const roles = user.roles.map((membership) => membership.role.key);
    const permissions = user.roles.flatMap((membership) =>
      membership.role.permissions.map((item) => item.permission.key)
    );

    (req as AuthedRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions
    };

    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Token invalide"));
  }
};

export const requireRoles =
  (allowedRoles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user) return next(new HttpError(401, "Authentification requise"));
    if (user.roles.includes("super_admin")) return next();

    const authorized = user.roles.some((role) => allowedRoles.includes(role));
    if (!authorized) return next(new HttpError(403, "Permission refusee"));
    next();
  };

export const requirePermissions =
  (allowedPermissions: string[]) => (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user) return next(new HttpError(401, "Authentification requise"));
    if (user.roles.includes("super_admin")) return next();

    const authorized = user.permissions.some((permission) => allowedPermissions.includes(permission));
    if (!authorized) return next(new HttpError(403, "Permission refusee"));
    next();
  };
