import crypto from "node:crypto";
import type { Request } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../prisma/client.js";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

/**
 * Convertit une durée JWT ("15m", "7d", "1h"…) en millisecondes.
 * Lève une erreur si le format est invalide — évite le fallback silencieux.
 */
const durationToMs = (value: string): number => {
  const match = value.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(
      `Format de durée invalide: "${value}". Utilisez un suffixe s/m/h/d/w (ex: "15m", "7d").`
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60 * 1_000,
    h: 60 * 60 * 1_000,
    d: 24 * 60 * 60 * 1_000,
    w: 7 * 24 * 60 * 60 * 1_000
  };
  return amount * multipliers[unit];
};

export const tokenHash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as SignOptions);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;

export const createRefreshToken = async (
  req: Request,
  payload: Pick<AuthTokenPayload, "sub" | "email" | "roles">
) => {
  const refreshToken = jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      nonce: crypto.randomBytes(24).toString("hex"),
      typ: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: tokenHash(refreshToken),
      userId: payload.sub,
      expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN)),
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    }
  });

  return refreshToken;
};

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload & { typ?: string };
