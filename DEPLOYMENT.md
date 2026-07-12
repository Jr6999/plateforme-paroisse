# Guide de déploiement — Koyeb

## Prérequis

- Compte [Koyeb](https://app.koyeb.com)
- Dépôt GitHub : `https://github.com/Jr6999/plateforme-paroisse`
- Base de données PostgreSQL hébergée (Koyeb Postgres, Neon, ou Supabase)

---

## 1. Base de données PostgreSQL

### Option A — Koyeb Postgres (recommandé)
1. Dashboard Koyeb → **Databases** → **Create Database**
2. Choisir PostgreSQL 16
3. Copier la `DATABASE_URL` fournie

### Option B — Neon (gratuit)
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un projet et copier la connection string

---

## 2. Secrets GitHub

Dans GitHub → Settings → Secrets → Actions, ajouter :

| Secret | Description |
|--------|-------------|
| `KOYEB_API_TOKEN` | Token API Koyeb (Dashboard → Account → API) |
| `DATABASE_URL` | URL PostgreSQL de production |
| `JWT_ACCESS_SECRET` | Secret JWT (min 32 chars) — `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Secret JWT refresh (min 32 chars) |
| `COOKIE_SECRET` | Secret cookie (min 32 chars) |
| `API_URL` | URL publique du service API Koyeb |
| `WEB_URL` | URL publique du service Web Koyeb |
| `CORS_ORIGINS` | URL du frontend (= WEB_URL) |

---

## 3. Déploiement sur Koyeb

### Service API
1. Dashboard Koyeb → **Create Service** → **GitHub**
2. Sélectionner `Jr6999/plateforme-paroisse`
3. Branch : `main`
4. Dockerfile : `apps/api/Dockerfile`
5. Port : `4000`
6. Health check : `GET /health`
7. Ajouter toutes les variables d'environnement

### Service Web
1. Dashboard Koyeb → **Create Service** → **GitHub**
2. Sélectionner `Jr6999/plateforme-paroisse`
3. Branch : `main`
4. Dockerfile : `apps/web/Dockerfile`
5. Build args :
   - `NEXT_PUBLIC_API_URL=https://<api-url>/api`
   - `NEXT_PUBLIC_SITE_URL=https://<web-url>`
6. Port : `3000`

---

## 4. Déploiement automatique (CI/CD)

Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement à chaque push sur `main` :

1. **CI** — install, build, tests
2. **Deploy API** — déploie le service API sur Koyeb
3. **Deploy Web** — déploie le service Web sur Koyeb

---

## 5. Variables d'environnement de production

```env
NODE_ENV=production
PORT=4000                          # Injecté automatiquement par Koyeb
DATABASE_URL=postgresql://...      # PostgreSQL hébergé
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
COOKIE_SECRET=<32+ chars>
API_URL=https://<api>.koyeb.app
WEB_URL=https://<web>.koyeb.app
CORS_ORIGINS=https://<web>.koyeb.app
```

---

## 6. Générer des secrets sécurisés

```bash
# JWT Access Secret
openssl rand -hex 32

# JWT Refresh Secret
openssl rand -hex 32

# Cookie Secret
openssl rand -hex 32
```
