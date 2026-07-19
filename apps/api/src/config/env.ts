import dotenv from "dotenv";
import path from "node:path";
import { z, ZodError } from "zod";

// Charger .env depuis le répertoire courant puis depuis la racine du monorepo
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

// ── Compatibilité multi-plateformes ──────────────────────────────────────────
// Render / Railway / Koyeb injectent PORT mais pas API_PORT
if (!process.env.API_PORT && process.env.PORT) {
  process.env.API_PORT = process.env.PORT;
}
// URL publique Render
if (!process.env.API_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.API_URL = process.env.RENDER_EXTERNAL_URL;
}
// URL publique Koyeb
if (!process.env.API_URL && process.env.KOYEB_PUBLIC_DOMAIN) {
  process.env.API_URL = `https://${process.env.KOYEB_PUBLIC_DOMAIN}`;
}
// URL publique Railway
if (!process.env.API_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.API_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

// ── Schéma de validation des variables d'environnement ───────────────────────
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Port — injecté automatiquement par Render/Railway/Koyeb
  PORT: z.coerce.number().default(4000),
  API_PORT: z.coerce.number().default(4000),

  // URLs
  API_URL: z.string().url().default("http://localhost:4000"),
  WEB_URL: z.string().url().default("http://localhost:3000"),

  // Base de données — OBLIGATOIRE
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL est obligatoire. Format: postgresql://user:pass@host:port/db"),

  // JWT — OBLIGATOIRES et sécurisés
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET doit contenir au minimum 32 caractères. Générer avec: openssl rand -hex 32"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET doit contenir au minimum 32 caractères. Générer avec: openssl rand -hex 32"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Cookie secret — optionnel mais recommandé
  COOKIE_SECRET: z
    .string()
    .min(16, "COOKIE_SECRET doit contenir au minimum 16 caractères")
    .optional(),

  // CORS
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  // Sécurité
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),

  // Cloudinary — optionnel
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // SMTP — optionnel
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z
    .string()
    .default("Cathedrale Saint Sauveur <noreply@cathedrale-natitingou.bj>")
});

// ── Parsing et gestion des erreurs lisibles ───────────────────────────────────
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const lines = error.errors.map(
        (e) => `  ✗ ${e.path.join(".")}: ${e.message}`
      );
      console.error("╔══════════════════════════════════════════════════════════╗");
      console.error("║  ERREUR : Variables d'environnement manquantes ou         ║");
      console.error("║  invalides. Le serveur ne peut pas démarrer.              ║");
      console.error("╚══════════════════════════════════════════════════════════╝");
      console.error("Variables problématiques :");
      lines.forEach((l) => console.error(l));
      console.error("");
      console.error("Solution : Vérifiez votre fichier .env ou les variables");
      console.error("           configurées dans le dashboard Render/Koyeb.");
      console.error("Référence : Consultez le fichier .env.example du projet.");
    }
    process.exit(1);
  }
}

export const env = parseEnv();

// Port effectif : PORT (injecté par la plateforme) > API_PORT > 4000
export const effectivePort = env.PORT !== 4000 ? env.PORT : env.API_PORT;

export const corsOrigins = Array.from(
  new Set([
    env.WEB_URL,
    ...env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ])
);
