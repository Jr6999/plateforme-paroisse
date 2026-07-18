import { createApp } from "./app.js";
import { effectivePort, env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const app = createApp();

// Écoute sur 0.0.0.0 requis pour Render / Railway / Koyeb / Docker
const server = app.listen(effectivePort, "0.0.0.0", () => {
  console.log(`[API] Cathédrale Saint Sauveur — port ${effectivePort}`);
  console.log(`[API] Swagger disponible sur http://localhost:${effectivePort}/docs`);
  console.log(`[API] Health check : http://localhost:${effectivePort}/health`);
  console.log(`[API] Environnement : ${env.NODE_ENV}`);
});

const shutdown = async (signal: string) => {
  console.log(`[API] Signal ${signal} reçu — arrêt en cours…`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[API] Connexion Prisma fermée");
    process.exit(0);
  });

  // Force l'arrêt après 10 secondes si le serveur ne se ferme pas proprement
  setTimeout(() => {
    console.error("[API] Arrêt forcé après timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Capture les rejets de promesse non gérés pour les logger sans crasher
process.on("unhandledRejection", (reason) => {
  console.error("[API] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[API] Uncaught Exception:", error);
  process.exit(1);
});
