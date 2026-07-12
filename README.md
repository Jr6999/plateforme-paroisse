# Plateforme Paroisse Cathedrale

Monorepo pour une plateforme paroissiale avec une API Express/Prisma et une application web Next.js.

## Prerequis

- Node.js 22 ou plus
- npm 10 ou plus
- Docker, pour lancer PostgreSQL localement

## Installation

```powershell
Copy-Item .env.example .env
npm install
npm run db:generate
```

## Developpement local

```powershell
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

L'application web est disponible sur `http://localhost:3000`.
L'API est disponible sur `http://localhost:4000`, avec Swagger sur `http://localhost:4000/docs`.

Comptes de demonstration apres le seed :

- Admin : `admin@paroisse.local` / `Paroisse@2026`
- Catechiste : `catechiste@paroisse.local` / `Paroisse@2026`

## Verification

```powershell
npm run lint
npm run build
npm test
```

## Deploiement gratuit

La configuration Render de l'API est dans `render.yaml`.
Le guide complet Vercel + Render + Neon est dans `docs/deployment.md`.

## Docker

```powershell
docker compose up --build
```

Les migrations Prisma sont appliquees au demarrage du conteneur API.
