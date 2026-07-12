import { Router } from "express";
import { asyncHandler } from "../common/async-handler.js";
import { audit } from "../common/audit.js";
import { HttpError } from "../common/http-error.js";
import { validate } from "../common/validate.js";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthedRequest } from "./middleware.js";
import { hashPassword, verifyPassword } from "./password.js";
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema } from "./schemas.js";
import { createRefreshToken, signAccessToken, tokenHash, verifyRefreshToken } from "./tokens.js";

export const authRouter = Router();

const userResponse = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  avatarUrl: true,
  emailVerifiedAt: true,
  status: true,
  roles: {
    include: { role: true }
  }
} as const;

const serializeUser = (user: {
  roles: { role: { key: string; label: string } }[];
  [key: string]: unknown;
}) => ({
  ...user,
  roles: user.roles.map((item) => item.role)
});

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) throw new HttpError(409, "Cette adresse email est deja utilisee");

    const defaultRole = await prisma.role.upsert({
      where: { key: "membre" },
      update: {},
      create: { key: "membre", label: "Utilisateur membre" }
    });

    const user = await prisma.user.create({
      data: {
        email: req.body.email.toLowerCase(),
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        passwordHash: await hashPassword(req.body.password),
        roles: {
          create: { roleId: defaultRole.id }
        }
      },
      select: userResponse
    });

    const roles = user.roles.map((membership) => membership.role.key);
    const accessToken = signAccessToken({ sub: user.id, email: user.email, roles });
    const refreshToken = await createRefreshToken(req, { sub: user.id, email: user.email, roles });

    await audit(req, "auth.register", "User", user.id);

    res.status(201).json({ user: serializeUser(user), accessToken, refreshToken });
  })
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() },
      include: { roles: { include: { role: true } } }
    });

    if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
      throw new HttpError(401, "Identifiants invalides");
    }
    if (user.status !== "ACTIVE") throw new HttpError(403, "Compte inactif");

    const roles = user.roles.map((membership) => membership.role.key);
    const accessToken = signAccessToken({ sub: user.id, email: user.email, roles });
    const refreshToken = await createRefreshToken(req, { sub: user.id, email: user.email, roles });

    await audit(req, "auth.login", "User", user.id);

    res.json({
      user: serializeUser({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        status: user.status,
        roles: user.roles
      }),
      accessToken,
      refreshToken
    });
  })
);

authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    const payload = verifyRefreshToken(req.body.refreshToken);
    if (payload.typ !== "refresh") throw new HttpError(401, "Refresh token invalide");

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: tokenHash(req.body.refreshToken) },
      include: { user: { include: { roles: { include: { role: true } } } } }
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new HttpError(401, "Session expiree");
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() }
    });

    const roles = stored.user.roles.map((membership) => membership.role.key);
    const accessToken = signAccessToken({ sub: stored.user.id, email: stored.user.email, roles });
    const refreshToken = await createRefreshToken(req, {
      sub: stored.user.id,
      email: stored.user.email,
      roles
    });

    res.json({ accessToken, refreshToken });
  })
);

authRouter.post(
  "/logout",
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: tokenHash(req.body.refreshToken), revokedAt: null },
      data: { revokedAt: new Date() }
    });

    res.status(204).send();
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const authed = req as AuthedRequest;
    if (!authed.user) throw new HttpError(401, "Authentification requise");
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: authed.user.id },
      select: userResponse
    });

    res.json({ user: serializeUser(user) });
  })
);

authRouter.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  asyncHandler(async (req, res) => {
    // req.body.email est déjà validé et nettoyé par le middleware validate()
    const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
    if (user) await audit(req, "auth.forgot_password", "User", user.id);

    res.json({
      message:
        "Si un compte existe pour cette adresse, un email de recuperation sera envoye."
    });
  })
);
