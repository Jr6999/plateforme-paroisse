import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { analyticsRouter } from "./analytics/routes.js";
import { announcementsRouter } from "./announcements/routes.js";
import { attendanceRouter } from "./attendance/routes.js";
import { authRouter } from "./auth/routes.js";
import { catechumensRouter } from "./catechumens/routes.js";
import { commentsRouter } from "./comments/routes.js";
import { communitiesRouter } from "./communities/routes.js";
import { corsOrigins, env } from "./config/env.js";
import { asyncHandler } from "./common/async-handler.js";
import { errorHandler } from "./common/error-handler.js";
import { historyRouter } from "./history/routes.js";
import { leadersRouter } from "./leaders/routes.js";
import { notificationsRouter } from "./notifications/routes.js";
import { prisma } from "./prisma/client.js";
import { eventsRouter } from "./events/routes.js";
import { sacredRhythmsRouter } from "./sacred-rhythms/routes.js";
import { uploadsDirectory, uploadsRouter } from "./uploads/routes.js";
import { usersRouter } from "./users/routes.js";

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Plateforme Paroisse Cathedrale",
      version: "0.1.0",
      description:
        "API REST pour la gestion historique, communautaire, catechetique et administrative de la paroisse."
    },
    servers: [{ url: `${env.API_URL}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    tags: [
      { name: "auth" },
      { name: "users" },
      { name: "announcements" },
      { name: "comments" },
      { name: "events" },
      { name: "communities" },
      { name: "catechumens" },
      { name: "attendance" },
      { name: "sacred-rhythms" },
      { name: "history" },
      { name: "leaders" },
      { name: "notifications" }
    ]
  },
  apis: ["./src/**/*.ts"]
});

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origine CORS non autorisee"));
      },
      credentials: true
    })
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Rate limit renforcé sur les routes d'authentification (anti-brute-force)
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." }
  });
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/uploads", express.static(uploadsDirectory));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const api = express.Router();
  api.use("/auth", authRateLimit, authRouter);
  api.use("/users", usersRouter);
  api.use("/announcements", announcementsRouter);
  api.use("/comments", commentsRouter);
  api.use("/events", eventsRouter);
  api.use("/communities", communitiesRouter);
  api.use("/catechumens", catechumensRouter);
  api.use("/attendance", attendanceRouter);
  api.use("/sacred-rhythms", sacredRhythmsRouter);
  api.use("/history", historyRouter);
  api.use("/leaders", leadersRouter);
  api.use("/notifications", notificationsRouter);
  api.use("/uploads", uploadsRouter);
  api.use("/analytics", analyticsRouter);
  api.get(
    "/search",
    asyncHandler(async (req, res) => {
      const q = String(req.query.q ?? "").trim();
      if (q.length < 2) return res.json({ announcements: [], events: [], communities: [], history: [] });

      const [announcements, events, communities, history] = await Promise.all([
        prisma.announcement.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } }
            ]
          },
          take: 8
        }),
        prisma.event.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } }
            ]
          },
          take: 8
        }),
        prisma.community.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { mission: { contains: q, mode: "insensitive" } }
            ]
          },
          take: 8
        }),
        prisma.parishHistory.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } }
            ]
          },
          take: 8
        })
      ]);

      res.json({ announcements, events, communities, history });
    })
  );

  app.use("/api", api);
  app.use(errorHandler);

  return app;
};
