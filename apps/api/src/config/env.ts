import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

// Charger .env depuis le répertoire courant puis depuis la racine du monorepo
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

// Compatibilité Render / Railway / Koyeb :
// Ces plateformes injectent PORT mais pas API_PORT
if (!process.env.API_PORT && process.env.PORT) {
  process.env.API_PORT = process.env.PORT;
}

// Compatibilité URL publique Render
if (!process.env.API_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.API_URL = process.env.RENDER_EXTERNAL_URL;
}

// Compatibilité URL publique Koyeb
if (!process.env.API_URL && process.env.KOYEB_PUBLIC_DOMAIN) {
  process.env.API_URL = `https://${process.env.KOYEB_PUBLIC_DOMAIN}`;
}

// Compatibilité Railway
if (!process.env.API_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.API_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // PORT est la variable standard des plateformes cloud
  PORT: z.coerce.number().default(4000),
  API_PORT: z.coerce.number().default(4000),
  API_URL: z.string().url().default("http://localhost:4000"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECRET: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z
    .string()
    .default("Cathedrale Saint Sauveur <noreply@cathedrale-natitingou.bj>")
});

export const env = envSchema.parse(process.env);

// Le port effectif : PORT (injecté par la plateforme) > API_PORT > 4000
export const effectivePort = env.PORT !== 4000 ? env.PORT : env.API_PORT;

export const corsOrigins = Array.from(
  new Set([
    env.WEB_URL,
    ...env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ])
);
