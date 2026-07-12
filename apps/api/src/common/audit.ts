import type { Prisma } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "../prisma/client.js";

export const audit = async (
  req: Request,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Prisma.InputJsonObject
) => {
  const user = (req as Request & { user?: { id: string } }).user;

  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      userId: user?.id,
      ipAddress: req.ip,
      metadata
    }
  });
};
