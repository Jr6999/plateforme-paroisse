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

// ── Swagger ───────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Plateforme Paroissiale Cathédrale — API",
      version: "1.0.0",
      description:
        "API REST pour la gestion historique, communautaire, catéchétique et administrative de la Cathédrale Saint Sauveur de Natitingou, Bénin.",
      contact: {
        name: "Support technique",
        email: "noreply@cathedrale-natitingou.bj"
      }
    },
    servers: [
      {
        url: `${env.API_URL}/api`,
        description: env.NODE_ENV === "production" ? "Production" : "Développement local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token obtenu via POST /api/auth/login"
        }
      }
    },
    tags: [
      { name: "auth", description: "Authentification et gestion des sessions" },
      { name: "users", description: "Gestion des utilisateurs" },
      { name: "announcements", description: "Annonces paroissiales" },
      { name: "comments", description: "Commentaires et réactions" },
      { name: "events", description: "Événements paroissiaux" },
      { name: "communities", description: "Communautés et mouvements" },
      { name: "catechumens", description: "Gestion des catéchumènes" },
      { name: "attendance", description: "Présences et absences" },
      { name: "sacred-rhythms", description: "Rythmes sacrés et catéchèse" },
      { name: "history", description: "Histoire de la paroisse" },
      { name: "leaders", description: "Dirigeants et responsables" },
      { name: "notifications", description: "Notifications utilisateur" },
      { name: "uploads", description: "Upload de documents et médias" },
      { name: "analytics", description: "Tableau de bord et statistiques" }
    ]
  },
  apis: ["./src/**/*.ts"]
});

// ── App factory ───────────────────────────────────────────────────────────────
export const createApp = () => {
  const app = express();

  // Render / Nginx reverse proxy
  app.set("trust proxy", 1);

  // ── Sécurité ─────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Désactiver Content-Security-Policy pour Swagger UI (styles inline)
      contentSecurityPolicy:
        env.NODE_ENV === "production"
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // requis pour Swagger UI
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"]
              }
            }
          : false
    })
  );

  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin(origin, callback) {
        // Autoriser les requêtes sans origine (curl, Postman, Swagger)
        if (!origin || corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origine CORS non autorisée : ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
  );

  // ── Rate limiting global ──────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Trop de requêtes. Réessayez dans quelques instants." }
    })
  );

  // Rate limit renforcé sur auth (anti-brute-force)
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." }
  });

  // ── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // ── Logging ──────────────────────────────────────────────────────────────
  // "combined" en production pour compatibilité monitoring (Render, Datadog, etc.)
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // Uploads locaux uniquement en dev (prod → Cloudinary)
  if (env.NODE_ENV !== "production") {
    app.use("/uploads", express.static(uploadsDirectory));
  }

  // ── Route racine ─────────────────────────────────────────────────────────
  // Corrige le 404 sur GET / observé sur Render
  app.get("/", (_req, res) => {
    res.json({
      name: "Plateforme Paroissiale Cathédrale",
      description: "Cathédrale Saint Sauveur de Natitingou — API REST",
      status: "API opérationnelle",
      environment: env.NODE_ENV,
      version: "1.0.0",
      docs: `${env.API_URL}/docs`,
      health: `${env.API_URL}/health`
    });
  });

  // ── Health check ─────────────────────────────────────────────────────────
  // Vérifie la connexion DB — compatible Render Health Check
  app.get(
    "/health",
    asyncHandler(async (_req, res) => {
      let dbStatus: "connected" | "error" = "connected";
      let dbLatencyMs: number | null = null;

      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = Date.now() - start;
      } catch {
        dbStatus = "error";
      }

      const status = dbStatus === "connected" ? "ok" : "degraded";
      res.status(dbStatus === "connected" ? 200 : 503).json({
        status,
        database: dbStatus,
        dbLatencyMs,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: "1.0.0"
      });
    })
  );

  // ── Swagger UI ───────────────────────────────────────────────────────────
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    },
    customSiteTitle: "Cathédrale Saint Sauveur — API Docs"
  }));

  // ── Routes API ───────────────────────────────────────────────────────────
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

  // Recherche globale full-text
  api.get(
    "/search",
    asyncHandler(async (req, res) => {
      const q = String(req.query.q ?? "").trim();
      if (q.length < 2) {
        return res.json({ announcements: [], events: [], communities: [], history: [] });
      }

      const [announcements, events, communities, history] = await Promise.all([
        prisma.announcement.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } }
            ]
          },
          select: { id: true, title: true, slug: true, category: true },
          take: 8
        }),
        prisma.event.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } }
            ]
          },
          select: { id: true, title: true, slug: true, location: true },
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
          select: { id: true, name: true, slug: true, mission: true },
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
          select: { id: true, title: true, slug: true, period: true },
          take: 8
        })
      ]);

      res.json({ announcements, events, communities, history });
    })
  );

  app.use("/api", api);

  // ── Gestion des erreurs globale ──────────────────────────────────────────
  app.use(errorHandler);

  return app;
};
