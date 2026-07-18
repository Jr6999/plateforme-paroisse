# ═══════════════════════════════════════════════════════════════
#  Cathédrale Saint Sauveur de Natitingou — Frontend Web
#  Next.js 15 + TypeScript + Tailwind CSS
#  Compatible : Koyeb · Railway · Docker Compose
# ═══════════════════════════════════════════════════════════════

# ── Stage 1 : dépendances ────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

# ── Stage 2 : build Next.js ──────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables connues au build (NEXT_PUBLIC_* sont embarquées dans le bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace apps/web

# ── Stage 3 : runner standalone ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Koyeb / Render injectent PORT automatiquement
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

# Next.js standalone génère un dossier .next/standalone avec server.js intégré
# Structure : apps/web/.next/standalone/apps/web/server.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "apps/web/server.js"]
