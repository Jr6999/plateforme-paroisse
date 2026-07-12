# Architecture

## Monorepo

- `apps/api` : API Express, validation Zod, authentification JWT, Prisma et PostgreSQL.
- `apps/web` : interface Next.js App Router avec Tailwind CSS et donnees de secours quand l'API est indisponible.
- `docker-compose.yml` : orchestration locale PostgreSQL, API et web.

## Flux principal

1. Le web appelle l'API via `NEXT_PUBLIC_API_URL`.
2. L'API valide les payloads avec Zod et applique les middlewares d'authentification/roles.
3. Prisma persiste les donnees dans PostgreSQL.
4. Les uploads locaux sont stockes dans `uploads/` et exposes par l'API sous `/uploads/:filename`.

## Modules metier

- Authentification, utilisateurs, roles et permissions.
- Annonces, commentaires et reactions.
- Evenements, inscriptions et presences.
- Communautes, dirigeants et historique paroissial.
- Catechese, catechumenes, rythmes sacres et rapports.
- Notifications, documents, galerie et audit trail.

## Environnements

Les variables attendues sont documentees dans `.env.example`. En developpement, copier ce fichier vers `.env`, puis lancer PostgreSQL avec Docker avant les migrations Prisma.
