# API

Base locale : `http://localhost:4000/api`

Documentation interactive : `http://localhost:4000/docs`

## Endpoints publics

- `GET /health`
- `GET /api/announcements`
- `GET /api/events`
- `GET /api/communities`
- `GET /api/leaders`
- `GET /api/history`
- `GET /api/sacred-rhythms`
- `GET /api/search?q=...`

## Authentification

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Les routes protegees attendent un header `Authorization: Bearer <accessToken>`.

## Administration

- `GET /api/users`
- `GET /api/analytics/dashboard`
- `POST /api/uploads` avec un champ multipart `file`
- `GET /api/uploads`
- `DELETE /api/uploads/:id`

Les roles utilises par le seed sont `super_admin`, `administrateur`, `responsable_communautaire`, `catechiste` et `membre`.
