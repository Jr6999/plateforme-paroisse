import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const app = createApp();

const server = app.listen(env.API_PORT, "0.0.0.0", () => {
  console.log(`API paroisse disponible sur le port ${env.API_PORT}`);
  console.log(`Swagger disponible sur http://localhost:${env.API_PORT}/docs`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
