# Guide de déploiement — Cathédrale Saint Sauveur de Natitingou

## Architecture de déploiement

```
GitHub (Jr6999/plateforme-paroisse)
       │
       ├── apps/api  ──→  Render Web Service (Node.js) ou Koyeb (Docker)
       ├── apps/web  ──→  Render Web Service (Node.js) ou Koyeb (Docker)
       └── PostgreSQL ──→  Render PostgreSQL ou Neon (gratuit)
```

---

## Option A — Déploiement sur Render (recommandé, gratuit)

### Étape 1 — Base de données PostgreSQL

1. Aller sur [dashboard.render.com](https://dashboard.render.com)
2. **New** → **PostgreSQL**
3. Nom : `cathedrale-postgres`
4. Plan : Free
5. Région : Frankfurt (EU)
6. Cliquer **Create Database**
7. Copier la **Internal Database URL** (pour l'API)

---

### Étape 2 — Service API (Backend Express)

1. **New** → **Web Service**
2. Connecter le dépôt GitHub : `Jr6999/plateforme-paroisse`
3. Configurer :
   - **Name** : `cathedrale-api`
   - **Root Directory** : *(laisser vide)*
   - **Build Command** : `npm ci && npm run build --workspace apps/api`
   - **Start Command** : `cd apps/api && npm run prisma:migrate && npm start`
   - **Plan** : Free
4. Variables d'environnement à ajouter :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(URL PostgreSQL Render)* |
| `JWT_ACCESS_SECRET` | *(openssl rand -hex 32)* |
| `JWT_REFRESH_SECRET` | *(openssl rand -hex 32)* |
| `COOKIE_SECRET` | *(openssl rand -hex 32)* |
| `API_URL` | `https://cathedrale-api.onrender.com` |
| `WEB_URL` | `https://cathedrale-web.onrender.com` |
| `CORS_ORIGINS` | `https://cathedrale-web.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | *(depuis cloudinary.com)* |
| `CLOUDINARY_API_KEY` | *(depuis cloudinary.com)* |
| `CLOUDINARY_API_SECRET` | *(depuis cloudinary.com)* |

5. Cliquer **Create Web Service**

---

### Étape 3 — Service Web (Frontend Next.js)

1. **New** → **Web Service**
2. Connecter le même dépôt GitHub
3. Configurer :
   - **Name** : `cathedrale-web`
   - **Build Command** : `npm ci && npm run build --workspace apps/web`
   - **Start Command** : `cd apps/web && npm start`
   - **Plan** : Free
4. Variables d'environnement :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://cathedrale-api.onrender.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://cathedrale-web.onrender.com` |

---

### Étape 4 — CI/CD automatique

Ajouter ces secrets GitHub (Settings → Secrets → Actions) :

| Secret | Description |
|---|---|
| `RENDER_API_KEY` | Render Dashboard → Account → API Keys |
| `RENDER_API_SERVICE_ID` | ID du service API (dans l'URL du service) |
| `RENDER_WEB_SERVICE_ID` | ID du service Web |

Chaque push sur `main` déclenche automatiquement le déploiement.

---

## Option B — Déploiement sur Koyeb (Docker)

Koyeb construit les images Docker directement depuis GitHub.

### Étape 1 — Base de données

Utiliser **Neon** (gratuit) : [neon.tech](https://neon.tech)
- Créer un projet → Copier la `Connection String`

### Étape 2 — Service API sur Koyeb

1. [app.koyeb.com](https://app.koyeb.com) → **Create Service**
2. Source : **GitHub** → `Jr6999/plateforme-paroisse`
3. Branch : `main`
4. Dockerfile : `apps/api/Dockerfile`
5. Port : `4000`
6. Health check : `GET /health`
7. Variables d'environnement : (voir tableau ci-dessus)

### Étape 3 — Service Web sur Koyeb

1. **Create Service** → GitHub → même dépôt
2. Dockerfile : `apps/web/Dockerfile`
3. Build args :
   - `NEXT_PUBLIC_API_URL=https://cathedrale-api-XXXX.koyeb.app/api`
   - `NEXT_PUBLIC_SITE_URL=https://cathedrale-web-XXXX.koyeb.app`
4. Port : `3000`

---

## Générer des secrets sécurisés

```bash
# JWT Access Secret
openssl rand -hex 32

# JWT Refresh Secret
openssl rand -hex 32

# Cookie Secret
openssl rand -hex 32
```

---

## Vérification après déploiement

```bash
# Health check API
curl https://cathedrale-api.onrender.com/health

# Test endpoint public
curl https://cathedrale-api.onrender.com/api/announcements

# Swagger UI
open https://cathedrale-api.onrender.com/docs
```
