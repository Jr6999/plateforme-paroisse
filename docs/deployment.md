# Deploiement gratuit

Architecture recommandee :

- Web Next.js : Vercel Hobby
- API Express : Render Free Web Service
- PostgreSQL : Neon Free

Cette separation garde le front rapide et evite Render Postgres Free, qui expire apres 30 jours.
Render Free reste adapte pour une demo ou un petit projet : le service API peut se mettre en veille apres inactivite et redemarre a la premiere requete.

## 1. Publier le depot Git

Pousse le projet sur GitHub, GitLab ou Bitbucket. Render et Vercel utiliseront ce depot pour les deploiements automatiques.

## 2. Creer la base Neon

1. Cree un projet PostgreSQL sur Neon Free.
2. Copie l'URL de connexion directe avec `sslmode=require`.
3. Garde cette URL pour la variable `DATABASE_URL` de Render.

## 3. Deployer l'API sur Render

Utilise le fichier `render.yaml` a la racine du depot.

Variables demandees par Render :

- `DATABASE_URL` : URL PostgreSQL Neon.
- `WEB_URL` : URL publique Vercel finale, par exemple `https://paroisse-cathedrale.vercel.app`.
- `CORS_ORIGINS` : meme URL que `WEB_URL`, puis ajoute les domaines utiles separes par des virgules.

Render genere automatiquement :

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`

Le service lance les migrations au demarrage avec :

```bash
npm run db:deploy --workspace apps/api && npm run start --workspace apps/api
```

Pour injecter les donnees de demonstration dans Neon depuis ta machine :

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
npm run db:deploy
npm run db:seed
Remove-Item Env:\DATABASE_URL
```

Change ensuite les mots de passe des comptes de demonstration si le site devient public.

## 4. Deployer le web sur Vercel

Importe le meme depot dans Vercel avec ces reglages :

- Root Directory : `apps/web`
- Install Command : `npm install`
- Build Command : `npm run build`
- Framework Preset : Next.js

Variables Vercel :

- `API_URL` : `https://<render-service>.onrender.com/api`
- `NEXT_PUBLIC_API_URL` : `https://<render-service>.onrender.com/api`
- `NEXT_PUBLIC_SITE_URL` : URL Vercel du site

Apres le premier deploiement Vercel, retourne sur Render et mets a jour :

- `WEB_URL`
- `CORS_ORIGINS`

## 5. Verifications apres publication

API :

```text
https://<render-service>.onrender.com/health
https://<render-service>.onrender.com/docs
```

Web :

```text
https://<vercel-project>.vercel.app
https://<vercel-project>.vercel.app/auth/connexion
```

Les comptes de demonstration du seed sont :

- `admin@paroisse.local` / `Paroisse@2026`
- `catechiste@paroisse.local` / `Paroisse@2026`
