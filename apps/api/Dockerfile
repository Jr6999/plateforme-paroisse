# ═══════════════════════════════════════════════════════════════
#  Cathédrale Saint Sauveur de Natitingou — API Backend
#  Express 5 + TypeScript + Prisma + PostgreSQL
#  Compatible : Render · Koyeb · Railway · Docker Compose
# ═══════════════════════════════════════════════════════════════

# ── Stage 1 : dépendances ────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copier uniquement les manifests pour tirer parti du cache Docker
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

# NE PAS utiliser --ignore-scripts : postinstall déclenche prisma generate
RUN npm ci

# ── Stage 2 : build TypeScript ───────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génère le client Prisma + compile TypeScript
RUN npm run build --workspace apps/api

# ── Stage 3 : runner production ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Koyeb / Render injectent PORT automatiquement
ENV PORT=4000
ENV PATH=/app/node_modules/.bin:$PATH

# Utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodeapp -u 1001 -G nodejs

# Copier uniquement les artefacts nécessaires
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

USER nodeapp

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# En production : appliquer les migrations puis démarrer le serveur
CMD ["sh", "-c", "prisma migrate deploy && node dist/src/server.js"]
