import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });

if (!process.env.DATABASE_URL && process.argv.includes("generate")) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/parish_platform?schema=public";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL")
  }
});
