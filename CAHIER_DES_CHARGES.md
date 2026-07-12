# Cahier des Charges — Plateforme Paroissiale Cathédrale

**Version :** 1.0  
**Date :** Juin 2026  
**Statut :** Document de référence  
**Projet :** `plateforme-paroisse-cathedrale`

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et enjeux](#2-contexte-et-enjeux)
3. [Périmètre fonctionnel](#3-périmètre-fonctionnel)
4. [Acteurs et rôles](#4-acteurs-et-rôles)
5. [Modules fonctionnels détaillés](#5-modules-fonctionnels-détaillés)
6. [Architecture technique](#6-architecture-technique)
7. [Modèle de données](#7-modèle-de-données)
8. [Sécurité et confidentialité](#8-sécurité-et-confidentialité)
9. [Performances et disponibilité](#9-performances-et-disponibilité)
10. [Interface utilisateur et accessibilité](#10-interface-utilisateur-et-accessibilité)
11. [Intégrations externes](#11-intégrations-externes)
12. [Déploiement et infrastructure](#12-déploiement-et-infrastructure)
13. [Tests et qualité](#13-tests-et-qualité)
14. [Évolutions futures](#14-évolutions-futures)
15. [Glossaire](#15-glossaire)

---

## 1. Présentation du projet

### 1.1 Intitulé

**Plateforme communautaire, historique, événementielle et administrative de la Paroisse Cathédrale.**

### 1.2 Objet

Ce cahier des charges définit les exigences fonctionnelles, techniques, de sécurité et d'exploitation d'une application web progressive (PWA) destinée à la gestion numérique intégrale d'une paroisse cathédrale. La plateforme centralise la mémoire historique, la communication pastorale, la coordination des communautés, le suivi catéchétique et l'administration interne dans un environnement sécurisé, multi-rôles et accessible depuis tout appareil.

### 1.3 Commanditaire

Paroisse Cathédrale — Bureau paroissial et équipe de direction pastorale.

### 1.4 Équipe projet

| Rôle | Responsabilité |
|------|---------------|
| Chef de projet | Coordination générale, suivi des livrables |
| Développeur backend | API REST, base de données, sécurité |
| Développeur frontend | Interface web, PWA, accessibilité |
| Responsable pastoral | Validation fonctionnelle, recette métier |
| Administrateur système | Infrastructure, déploiement, sauvegardes |

---

## 2. Contexte et enjeux

### 2.1 Contexte

La paroisse cathédrale regroupe plusieurs milliers de fidèles, une douzaine de communautés et mouvements actifs, des équipes de catéchistes, des responsables liturgiques et une administration centrale. La gestion de cette activité repose aujourd'hui sur des outils dispersés : messages WhatsApp, fichiers Excel locaux, affichages physiques et communications orales.

Cette dispersion engendre des pertes d'informations, des doublons, une traçabilité insuffisante et une transmission de la mémoire institutionnelle fragilisée.

### 2.2 Enjeux

| Enjeu | Description |
|-------|-------------|
| **Mémoire** | Préserver et valoriser 68+ ans d'histoire paroissiale (archives, photos, documents) |
| **Communication** | Centraliser les annonces, événements et notifications vers les fidèles |
| **Coordination** | Organiser les communautés, leurs membres, leurs agendas et publications |
| **Catéchèse** | Suivre individuellement la progression, la présence et les sacrements des catéchumènes |
| **Administration** | Fournir un tableau de bord de gouvernance avec audit trail et statistiques |
| **Accessibilité** | Être disponible sur mobile sans connexion permanente (PWA offline) |

### 2.3 Objectifs mesurables

- Réduction du temps de publication d'une annonce paroissiale : de 48h (affichage physique) à moins de 5 minutes.
- Centralisation de 100 % des dossiers catéchumènes dans la plateforme en phase 1.
- Disponibilité de l'historique paroissial numérisé pour l'ensemble des fidèles connectés.
- Zéro perte de données sur les enregistrements de présence catéchétique.

---

## 3. Périmètre fonctionnel

### 3.1 Inclus dans le périmètre (v1)

- Authentification et gestion des comptes utilisateurs
- Gestion des annonces paroissiales (CRUD, catégories, tags, pièces jointes)
- Gestion des événements (calendrier, inscriptions, présences)
- Gestion des communautés et de leurs membres
- Gestion catéchétique (catéchumènes, rythmes sacrés, cours, présences, sacrements)
- Mémoire historique (frise chronologique, archives multimédia)
- Profils des dirigeants religieux (passés et présents)
- Messagerie interne (1-à-1 et communautaire)
- Système de notifications push et in-app
- Gestion des uploads (images, PDF, documents Word)
- Dashboard analytique et audit trail
- API REST documentée (OpenAPI 3.0)
- Application web progressive (PWA) avec support offline
- Système RBAC (contrôle d'accès basé sur les rôles)

### 3.2 Hors périmètre (v1) — prévu en évolutions futures

- Application mobile native (iOS / Android)
- Intégration CalDAV / synchronisation calendrier externe
- Système de dons en ligne et gestion financière
- Streaming liturgique intégré
- Forum de discussion communautaire
- Traduction multilingue de l'interface
- Gestion de la comptabilité paroissiale

---

## 4. Acteurs et rôles

### 4.1 Rôles système (RBAC)

La plateforme implémente un système de contrôle d'accès basé sur les rôles avec une hiérarchie à 6 niveaux.

| Rôle | Clé système | Description |
|------|-------------|-------------|
| Super Administrateur | `super_admin` | Accès illimité à toutes les fonctionnalités. Bypass de toutes les vérifications de rôle. |
| Administrateur | `administrateur` | Gestion complète du contenu, des utilisateurs, des modules et de la configuration. |
| Catéchiste | `catechiste` | Gestion des catéchumènes, suivi de présence, sacrements, rythmes sacrés. |
| Responsable communautaire | `responsable_communautaire` | Gestion de sa communauté, publication d'annonces et d'événements liés. |
| Membre | `membre` | Consultation du contenu public, inscription aux événements, interactions (commentaires, réactions). |
| Invité | `invited` | Compte créé mais non encore activé. Accès en lecture seule aux contenus publics. |

### 4.2 Matrice des permissions

| Action | super_admin | administrateur | catechiste | resp_comm. | membre |
|--------|:-----------:|:--------------:|:----------:|:----------:|:------:|
| Publier une annonce | ✓ | ✓ | — | ✓ (sa comm.) | — |
| Modérer les commentaires | ✓ | ✓ | — | ✓ (sa comm.) | — |
| Créer un événement | ✓ | ✓ | — | ✓ (sa comm.) | — |
| S'inscrire à un événement | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gérer les catéchumènes | ✓ | ✓ | ✓ | — | — |
| Enregistrer les présences | ✓ | ✓ | ✓ | — | — |
| Gérer les utilisateurs | ✓ | ✓ | — | — | — |
| Accéder au dashboard | ✓ | ✓ | ✓ | ✓ | — |
| Uploader des documents | ✓ | ✓ | ✓ | ✓ | — |
| Supprimer définitivement | ✓ | ✓ | — | — | — |
| Voir l'audit trail | ✓ | ✓ | — | — | — |

---

## 5. Modules fonctionnels détaillés

### 5.1 Module Authentification

#### Description
Système complet d'identité et de session sécurisé, gérant l'inscription, la connexion, le renouvellement de session et la récupération de mot de passe.

#### Fonctionnalités

**Inscription (`POST /api/auth/register`)**
- Saisie : email, mot de passe (min. 8 caractères, max. 128), nom complet, téléphone (optionnel), adresse (optionnel)
- Validation côté serveur via schéma Zod
- Hachage du mot de passe avec bcrypt (12 rounds minimum)
- Attribution automatique du rôle `membre`
- Génération d'un access token JWT (durée : 15 minutes) et d'un refresh token (durée : 7 jours)
- Audit de l'événement `auth.register`

**Connexion (`POST /api/auth/login`)**
- Vérification des identifiants
- Vérification du statut du compte (`ACTIVE` requis)
- Retour du profil utilisateur complet avec ses rôles

**Renouvellement de session (`POST /api/auth/refresh`)**
- Rotation automatique des refresh tokens (un token utilisé est immédiatement révoqué)
- Stockage du hash SHA-256 du refresh token (jamais le token brut)
- Vérification de l'expiration et de la révocation

**Déconnexion (`POST /api/auth/logout`)**
- Révocation immédiate du refresh token en base

**Récupération de mot de passe (`POST /api/auth/forgot-password`)**
- Réponse identique qu'un compte existe ou non (protection contre l'énumération d'emails)
- Journalisation de la demande dans l'audit trail

**Profil courant (`GET /api/auth/me`)**
- Retourne le profil complet avec rôles et permissions
- Nécessite un access token valide

#### Exigences de sécurité
- Les access tokens doivent rester en mémoire uniquement (jamais en localStorage)
- Les refresh tokens doivent être transmis via cookie HttpOnly (évolution requise)
- Rate limiting global : 120 requêtes / minute / IP

---

### 5.2 Module Annonces

#### Description
Gestion complète des publications paroissiales : rédaction, catégorisation, épinglage, commentaires threaded et réactions.

#### Fonctionnalités

**Liste des annonces (`GET /api/announcements`)**
- Pagination (page, limit, max 100)
- Filtres : catégorie, statut, recherche plein texte (titre, extrait, contenu)
- Tri : épinglées en premier, puis par date de publication décroissante
- Inclut auteur, communauté liée, compteurs commentaires/réactions

**Détail d'une annonce (`GET /api/announcements/:slug`)**
- Commentaires de niveau 1 avec leurs réponses imbriquées
- Documents joints
- Compteur de réactions

**Création (`POST /api/announcements`)** — `administrateur`, `responsable_communautaire`
- Champs : titre (3–180 car.), extrait (10–320 car.), contenu (min. 20 car.), catégorie, tags, communauté liée, épinglage, statut
- Sanitisation anti-XSS du contenu
- Génération automatique d'un slug unique (titre + timestamp base-36)
- Date de publication enregistrée automatiquement si statut = PUBLISHED

**Modification (`PATCH /api/announcements/:id`)** — même rôles
- Modification partielle (tous champs optionnels)
- Re-sanitisation des champs texte modifiés
- Mise à jour de la date de publication si passage à PUBLISHED

**Archivage logique (`DELETE /api/announcements/:id`)** — `administrateur`
- Pas de suppression physique : passage au statut ARCHIVED
- Audit de l'action

**Commentaires (`POST /api/comments`)** — utilisateur authentifié
- Commentaires de premier niveau et réponses imbriquées (1 niveau de profondeur)
- Modération possible (statut PUBLISHED / ARCHIVED)

**Réactions (`POST /api/announcements/:id/react`)** — utilisateur authentifié
- Type : LIKE (extensible)
- Unicité par utilisateur, entité et type de réaction

---

### 5.3 Module Événements

#### Description
Calendrier pastoral complet avec gestion des catégories, inscriptions, galerie et suivi de présence.

#### Fonctionnalités

**Liste des événements (`GET /api/events`)**
- Pagination + filtres : statut, plage de dates (from / to), recherche plein texte
- Tri par date de début croissante
- Inclut catégorie, communauté, compteurs d'inscriptions et de présences

**Détail (`GET /api/events/:slug`)**
- Liste des inscrits (nom uniquement)
- Galerie photo associée

**Création (`POST /api/events`)** — `administrateur`, `responsable_communautaire`
- Champs obligatoires : titre (3–180 car.), description (min. 20 car.), date de début, lieu (2–180 car.)
- Champs optionnels : date de fin, image de couverture, capacité, URL d'inscription externe, URL livestream, catégorie, communauté
- Statuts : DRAFT, SCHEDULED, LIVE, COMPLETED, CANCELLED

**Inscription (`POST /api/events/:id/register`)** — utilisateur authentifié
- Upsert : une seule inscription par utilisateur par événement
- Gestion des accompagnants (guests : entier >= 0)
- Note libre (max. 400 car.)

**Modification (`PATCH /api/events/:id`)** — mêmes rôles que création
- Sanitisation et recalcul du slug si le titre est modifié

**Catégories d'événements**
- Nom, slug, couleur hexadécimale, description
- Associées aux événements pour le filtrage visuel

---

### 5.4 Module Communautés

#### Description
Gestion des mouvements et groupes paroissiaux : chorale, jeunesse, prière, service, etc.

#### Fonctionnalités

**Liste / Détail (`GET /api/communities`, `GET /api/communities/:slug`)**
- Histoire, mission, coordinateur, galerie, membres, événements liés, annonces liées

**Création / Modification** — `administrateur`
- Champs : nom, logo, image de couverture, histoire, mission, coordinateur (userId), statut

**Adhésion (`POST /api/communities/:id/join`)** — utilisateur authentifié
- Rôle dans la communauté : `membre`, `responsable`, `modérateur`
- Unicité par utilisateur par communauté

**Messagerie communautaire**
- Messages texte liés à une communauté (canal de groupe)
- Messages privés 1-à-1 entre utilisateurs
- Marquage lu / non lu

---

### 5.5 Module Catéchèse

#### Description
Système de gestion individuelle des catéchumènes, parcours de formation et suivi sacramentel. Module réservé aux rôles catéchiste et administrateur.

#### Fonctionnalités — Catéchumènes

**Liste (`GET /api/catechumens`)** — authentifié
- Pagination, recherche (nom, prénom), filtre par statut et niveau

**Dossier individuel (`GET /api/catechumens/:id`)**
- Prénom, nom, sexe, date de naissance, photo, téléphone, adresse
- Niveau (Niveau 1, 2, 3...), progression en pourcentage (0–100)
- Statut : ACTIVE, PAUSED, COMPLETED, ARCHIVED
- Nom du tuteur / responsable légal
- Notes internes
- Responsable assigné (catéchiste)
- Historique des présences
- Registre des sacrements reçus

**Registre sacramentel (`POST /api/catechumens/:id/sacraments`)**
- Sacrement reçu (baptême, confirmation, première communion, etc.)
- Date de réception, église, notes

#### Fonctionnalités — Rythmes Sacrés (Parcours de Formation)

**Parcours (`GET /api/sacred-rhythms`)**
- Titre, thème, description, niveau, dates, lieu, instructeur

**Leçons (`SacredLesson`)**
- Titre, contenu, position dans le parcours, ressources pédagogiques (URL)

**Présences (`POST /api/attendance`)**
- Enregistrement par catéchumène et par séance (événement ou rythme sacré)
- Statuts : PRESENT, ABSENT, EXCUSED, LATE
- Type de séance (kind) : formation, culte dominical, retraite, etc.
- Note libre, enregistreur identifié

---

### 5.6 Module Histoire Paroissiale

#### Description
Frise chronologique numérique de la vie de la paroisse, de sa fondation à aujourd'hui.

#### Fonctionnalités

**Timeline (`GET /api/history`)**
- Pagination, tri par date chronologique
- Filtres : type (fondation, renovation, archive, célébration...), statut

**Entrée historique**
- Titre, slug unique, période (texte libre), date précise (optionnelle)
- Description longue
- Média associé (image, URL)
- Document associé (PDF, URL)
- Type : fondation, renovation, archive, celebration, etc.
- Statuts : DRAFT, PUBLISHED, ARCHIVED

---

### 5.7 Module Dirigeants

#### Description
Annuaire mémoriel des responsables religieux de la paroisse (curés, évêques, vicaires, diacres...).

#### Fonctionnalités

- Nom, titre, type de rôle (`roleType` : cure, eveque, vicaire, diacre...)
- Photo, biographie
- Dates de début et fin de service
- Réalisations (liste)
- Citations marquantes (liste)
- Ordre d'affichage personnalisable (`sortOrder`)
- Statuts DRAFT / PUBLISHED / ARCHIVED

---

### 5.8 Module Médias et Documents

#### Description
Gestion centralisée des fichiers multimédias (images, vidéos) et documents (PDF, Word) associés aux entités de la plateforme.

#### Types de médias (`MediaAsset`)
- IMAGE, VIDEO, AUDIO, PDF, DOCUMENT
- Association optionnelle à une galerie, un événement ou une communauté
- Intégration Cloudinary pour l'hébergement cloud (clé publique, thumbnail)

#### Documents (`Document`)
- Formats autorisés : JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX
- Taille maximale : 10 Mo par fichier
- Association à une annonce ou toute entité via `entityType` / `entityId`
- Upload authentifié uniquement
- Suppression physique du fichier local lors de la suppression en base

#### Galeries
- Album nommé, description, association à un type et identifiant d'entité
- Contient plusieurs `MediaAsset`

---

### 5.9 Module Notifications

#### Description
Système de notifications in-app permettant d'informer les utilisateurs d'événements pertinents.

#### Types de notifications
- ANNOUNCEMENT : nouvelle annonce publiée
- EVENT : événement créé ou modifié
- COMMUNITY : activité dans une communauté suivie
- CATECHESIS : rappel ou mise à jour catéchétique
- SYSTEM : messages système (suspension, invitation, etc.)

#### Fonctionnalités
- Liste paginée des notifications de l'utilisateur connecté (`GET /api/notifications`)
- Marquage lu / non lu (date `readAt`)
- Lien de navigation associé (`link`)
- Compteur de non-lues affiché dans le header

---

### 5.10 Module Recherche Globale

**Endpoint (`GET /api/search?q=terme`)**
- Recherche simultanée dans : annonces, événements, communautés, histoire
- Minimum 2 caractères
- Maximum 8 résultats par catégorie
- Recherche insensible à la casse (mode PostgreSQL `insensitive`)

---

### 5.11 Module Dashboard Analytique

#### Description
Tableau de bord de gouvernance pastorale, réservé aux administrateurs, catéchistes et responsables communautaires.

#### Indicateurs affichés

| KPI | Description |
|-----|-------------|
| Utilisateurs | Nombre total de comptes inscrits |
| Annonces publiées | Annonces au statut PUBLISHED |
| Événements | Nombre total d'événements |
| Événements à venir | Événements dans les 30 prochains jours |
| Communautés actives | Communautés au statut PUBLISHED |
| Catéchumènes actifs | Catéchumènes au statut ACTIVE |

#### Visualisations
- Graphique en barres : répartition des présences catéchétiques (PRESENT / ABSENT / EXCUSED / LATE)
- Journal d'audit récent : 10 dernières actions (action, entité, date)

---

### 5.12 Module Audit Trail

#### Description
Journal immuable de toutes les actions significatives réalisées sur la plateforme.

#### Événements audités

| Code d'action | Déclencheur |
|---------------|-------------|
| `auth.register` | Inscription d'un nouveau compte |
| `auth.login` | Connexion réussie |
| `auth.forgot_password` | Demande de récupération |
| `announcement.create` | Création d'annonce |
| `announcement.update` | Modification d'annonce |
| `announcement.archive` | Archivage d'annonce |
| `event.create` | Création d'événement |
| `event.update` | Modification d'événement |
| `document.upload` | Upload de fichier |
| `document.delete` | Suppression de fichier |

#### Données enregistrées
- Utilisateur (nullable pour actions anonymes)
- Action (string dotnotation : `module.action`)
- Entité concernée + identifiant
- Adresse IP de la requête
- Métadonnées JSON libres

---

## 6. Architecture technique

### 6.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (PWA)                          │
│  Next.js 15 · App Router · Tailwind CSS · Zustand       │
│  TypeScript · Recharts · Lucide · Sonner · Playwright   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST / JSON
┌────────────────────▼────────────────────────────────────┐
│                  API REST (Node.js)                      │
│  Express 5 · TypeScript · Zod · JWT · Multer            │
│  Helmet · CORS · Rate Limit · Morgan · Swagger          │
└────────────────────┬────────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────────┐
│              Base de données PostgreSQL 16               │
│  28 modèles · Migrations versionnées · Indexes           │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Services externes (optionnels)              │
│  Cloudinary (médias) · SMTP (emails) · Push (PWA)        │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Structure du monorepo

```
plateforme-paroisse-cathedrale/
├── apps/
│   ├── api/                    # Backend Express + Prisma
│   │   ├── src/
│   │   │   ├── analytics/      # Dashboard statistiques
│   │   │   ├── announcements/  # Annonces paroissiales
│   │   │   ├── attendance/     # Présences catéchétiques
│   │   │   ├── auth/           # Authentification JWT
│   │   │   ├── catechumens/    # Dossiers catéchumènes
│   │   │   ├── comments/       # Commentaires
│   │   │   ├── common/         # Utilitaires partagés
│   │   │   ├── communities/    # Communautés
│   │   │   ├── config/         # Variables d'environnement
│   │   │   ├── events/         # Événements
│   │   │   ├── history/        # Histoire paroissiale
│   │   │   ├── leaders/        # Dirigeants
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── prisma/         # Client Prisma singleton
│   │   │   ├── sacred-rhythms/ # Rythmes sacrés
│   │   │   ├── uploads/        # Gestion fichiers
│   │   │   ├── users/          # Gestion utilisateurs
│   │   │   ├── app.ts          # Configuration Express
│   │   │   └── server.ts       # Point d'entrée
│   │   └── prisma/
│   │       ├── schema.prisma   # Schéma de données
│   │       ├── seed.ts         # Données initiales
│   │       └── migrations/     # Migrations versionnées
│   └── web/                    # Frontend Next.js
│       └── src/
│           ├── app/            # Routes App Router
│           ├── components/     # Composants UI / Layout / Sections
│           ├── features/       # Fonctionnalités complexes
│           ├── hooks/          # Hooks React personnalisés
│           ├── lib/            # Utilitaires et données de fallback
│           ├── providers/      # Providers React (theme, PWA)
│           ├── services/       # Appels API server-side
│           ├── store/          # État global Zustand
│           ├── styles/         # CSS global et tokens
│           └── types/          # Types TypeScript partagés
├── .github/workflows/ci.yml    # Pipeline CI/CD
├── .env / .env.example         # Variables d'environnement
└── package.json                # Monorepo workspaces npm
```

### 6.3 Stack technologique

#### Backend

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js | ≥ 20.18 |
| Framework HTTP | Express | 5.x |
| ORM | Prisma | 6.x |
| Base de données | PostgreSQL | 16 |
| Validation | Zod | 3.x |
| Authentification | JWT (jsonwebtoken) | 9.x |
| Hachage | bcryptjs | 3.x |
| Upload | Multer | 2.x |
| Sécurité | Helmet, CORS, Rate-limit | — |
| Logs | Morgan | 1.x |
| Documentation API | Swagger / OpenAPI 3.0 | — |
| Langage | TypeScript | 5.x |

#### Frontend

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 15.x |
| Langage | TypeScript | 5.x |
| CSS | Tailwind CSS | 3.x |
| État global | Zustand | — |
| Formulaires | React Hook Form + Zod | — |
| Graphiques | Recharts | — |
| Icônes | Lucide React | — |
| Notifications UI | Sonner | — |
| Polices | Inter + Playfair Display (Google Fonts) | — |
| E2E Tests | Playwright | — |

### 6.4 API REST — Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/refresh` | — | Renouvellement token |
| POST | `/api/auth/logout` | — | Déconnexion |
| GET | `/api/auth/me` | ✓ | Profil courant |
| POST | `/api/auth/forgot-password` | — | Récupération mot de passe |
| GET | `/api/users` | admin | Liste utilisateurs |
| PATCH | `/api/users/:id/status` | admin | Modifier statut utilisateur |
| GET | `/api/announcements` | — | Liste annonces |
| GET | `/api/announcements/:slug` | — | Détail annonce |
| POST | `/api/announcements` | admin/resp | Créer annonce |
| PATCH | `/api/announcements/:id` | admin/resp | Modifier annonce |
| DELETE | `/api/announcements/:id` | admin | Archiver annonce |
| GET | `/api/comments` | — | Commentaires |
| POST | `/api/comments` | ✓ | Créer commentaire |
| GET | `/api/events` | — | Liste événements |
| GET | `/api/events/:slug` | — | Détail événement |
| POST | `/api/events` | admin/resp | Créer événement |
| POST | `/api/events/:id/register` | ✓ | S'inscrire |
| PATCH | `/api/events/:id` | admin/resp | Modifier événement |
| GET | `/api/communities` | — | Liste communautés |
| GET | `/api/communities/:slug` | — | Détail communauté |
| POST | `/api/communities` | admin | Créer communauté |
| POST | `/api/communities/:id/join` | ✓ | Rejoindre communauté |
| GET | `/api/catechumens` | ✓ | Liste catéchumènes |
| GET | `/api/catechumens/:id` | ✓ | Dossier catéchumène |
| POST | `/api/catechumens` | catéchiste | Créer dossier |
| PATCH | `/api/catechumens/:id` | catéchiste | Modifier dossier |
| GET | `/api/attendance` | ✓ | Présences |
| POST | `/api/attendance` | catéchiste | Enregistrer présence |
| GET | `/api/sacred-rhythms` | — | Rythmes sacrés |
| POST | `/api/sacred-rhythms` | catéchiste | Créer parcours |
| GET | `/api/history` | — | Histoire paroissiale |
| POST | `/api/history` | admin | Ajouter entrée |
| GET | `/api/leaders` | — | Dirigeants |
| POST | `/api/leaders` | admin | Ajouter dirigeant |
| GET | `/api/notifications` | ✓ | Notifications utilisateur |
| PATCH | `/api/notifications/:id/read` | ✓ | Marquer lu |
| GET | `/api/uploads` | ✓ | Documents |
| POST | `/api/uploads` | ✓ | Uploader fichier |
| DELETE | `/api/uploads/:id` | admin | Supprimer fichier |
| GET | `/api/analytics/dashboard` | admin/catéchiste/resp | Dashboard |
| GET | `/api/search?q=` | — | Recherche globale |
| GET | `/health` | — | Health check |
| GET | `/docs` | — | Documentation Swagger |

---

## 7. Modèle de données

### 7.1 Vue relationnelle simplifiée

```
User ─┬─ UserRole ─── Role ─── RolePermission ─── Permission
      ├─ RefreshToken
      ├─ Announcement (author) ─┬─ Comment ─── Reaction
      │                         ├─ Reaction
      │                         └─ Document
      ├─ EventRegistration ─── Event ─┬─ EventCategory
      │                               ├─ Attendance
      │                               └─ MediaAsset
      ├─ CommunityMember ─── Community ─┬─ Message
      │                                 ├─ MediaAsset
      │                                 └─ Announcement
      ├─ Catechumen ─┬─ SacramentRecord
      │              ├─ Attendance
      │              └─ SacredRhythm ─── SacredLesson
      ├─ Notification
      ├─ AuditLog
      └─ Document (uploader)

Gallery ─── MediaAsset
ParishHistory (indépendant)
Leader (indépendant)
Testimonial (indépendant)
```

### 7.2 Entités principales

**User** — Compte utilisateur  
Champs clés : id (cuid), email (unique), passwordHash, name, phone?, address?, avatarUrl?, emailVerifiedAt?, status (ACTIVE | INVITED | SUSPENDED | ARCHIVED)

**Announcement** — Annonce paroissiale  
Champs clés : title, slug (unique), excerpt, content, category, tags[], status, isPinned, authorId, communityId?, publishedAt?

**Event** — Événement  
Champs clés : title, slug, description, status (DRAFT | SCHEDULED | LIVE | COMPLETED | CANCELLED), startAt, endAt?, location, coverImageUrl?, capacity?, categoryId?, communityId?

**Community** — Communauté / mouvement  
Champs clés : name, slug, logoUrl?, coverImageUrl?, story, mission, status, coordinatorId?

**Catechumen** — Catéchumène  
Champs clés : firstName, lastName, sex, birthDate?, level, progression (0–100), status (ACTIVE | PAUSED | COMPLETED | ARCHIVED), guardianName?, responsibleId?

**SacredRhythm** — Parcours de formation  
Champs clés : title, slug, theme, description, level, startAt, endAt?, location?, instructorId?

**Attendance** — Enregistrement de présence  
Champs clés : catechumenId, kind (type de séance), status (PRESENT | ABSENT | EXCUSED | LATE), attendedAt, eventId?, sacredRhythmId?, recordedById?

**Leader** — Dirigeant religieux  
Champs clés : name, slug, title, roleType, biography, serviceStart?, serviceEnd?, accomplishments[], quotes[], sortOrder

**ParishHistory** — Entrée historique  
Champs clés : title, slug, period?, occurredAt?, description, mediaUrl?, documentUrl?, type

**AuditLog** — Journal d'audit  
Champs clés : userId?, action, entity, entityId?, ipAddress?, metadata (JSON)

### 7.3 Énumérations

| Enum | Valeurs |
|------|---------|
| `UserStatus` | ACTIVE, INVITED, SUSPENDED, ARCHIVED |
| `PublicationStatus` | DRAFT, PUBLISHED, ARCHIVED |
| `EventStatus` | DRAFT, SCHEDULED, LIVE, COMPLETED, CANCELLED |
| `AttendanceStatus` | PRESENT, ABSENT, EXCUSED, LATE |
| `CatechumenStatus` | ACTIVE, PAUSED, COMPLETED, ARCHIVED |
| `MediaType` | IMAGE, VIDEO, AUDIO, PDF, DOCUMENT |
| `NotificationType` | ANNOUNCEMENT, EVENT, COMMUNITY, CATECHESIS, SYSTEM |

---

## 8. Sécurité et confidentialité

### 8.1 Authentification et sessions

| Mesure | Détail |
|--------|--------|
| Hachage des mots de passe | bcrypt, 12 rounds minimum |
| Access token | JWT signé HS256, durée 15 minutes, en mémoire uniquement |
| Refresh token | JWT signé HS256, durée 7 jours, stocké en cookie HttpOnly (évolution requise), rotation à chaque utilisation |
| Stockage refresh token | Hash SHA-256 uniquement en base de données (jamais le token brut) |
| Révocation | Immédiate via le champ `revokedAt` en base |
| Secrets JWT | Minimum 24 caractères, différents pour access et refresh |

### 8.2 Protection des endpoints

- Middleware `requireAuth` : vérifie et décode le JWT, charge l'utilisateur depuis la base, vérifie le statut ACTIVE
- Middleware `requireRoles` : vérifie l'appartenance à au moins un rôle autorisé
- Middleware `requirePermissions` : vérification fine par clé de permission
- `super_admin` : bypass automatique de toutes les vérifications de rôle

### 8.3 Sécurité de l'API

| Mesure | Configuration |
|--------|---------------|
| En-têtes HTTP | Helmet (CSP, HSTS, XFO, etc.) |
| CORS | Whitelist d'origines configurable, credentials: true |
| Rate limiting | 120 req/min/IP (configurable) |
| Taille du body JSON | Limitée à 2 Mo |
| CORS COOP | `cross-origin` pour les assets statiques |
| Proxy de confiance | `trust proxy: 1` (pour Render, Railway, etc.) |

### 8.4 Sanitisation des données

- Suppression des balises `<script>` et de leur contenu
- Suppression des attributs d'événements HTML (`onXxx=`)
- Suppression des schémas `javascript:` et `vbscript:`
- Suppression des balises `<iframe>`, `<object>`, `<embed>`, `<form>`
- Application systématique sur tous les champs texte en écriture

### 8.5 Protection des fichiers uploadés

- Whitelist de types MIME : JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX
- Taille maximale : 10 Mo par fichier
- Nom de fichier généré côté serveur (slug + timestamp) — jamais le nom original
- Vérification de la résolution du chemin (path traversal prevention)

### 8.6 Données personnelles (RGPD)

- Les données personnelles des catéchumènes (mineurs potentiels) sont accessibles uniquement aux utilisateurs authentifiés avec rôle catéchiste ou supérieur
- Les numéros de téléphone et adresses sont stockés mais non exposés dans les routes publiques
- L'audit trail permet de tracer qui a accédé ou modifié quelles données
- La suppression d'un utilisateur déclenche une cascade (`onDelete: Cascade`) sur ses tokens, rôles et membres de communauté

---

## 9. Performances et disponibilité

### 9.1 Objectifs de performance

| Métrique | Cible |
|----------|-------|
| Temps de réponse API (p95) | < 300 ms |
| Time to First Byte (TTFB) web | < 800 ms |
| Score Lighthouse Performance | ≥ 85 |
| Score Lighthouse Accessibilité | ≥ 90 |
| Timeout des appels API côté web | 2 500 ms |
| Disponibilité (uptime) | ≥ 99 % |

### 9.2 Stratégies de performance

**Backend**
- Indexes PostgreSQL sur les colonnes fréquemment filtrées (status, createdAt, communityId, catechumenId + attendedAt, etc.)
- Pagination systématique sur toutes les listes (max 100 résultats par page)
- Requêtes Prisma optimisées avec `select` restrictifs sur les données publiques
- Compression gzip via le middleware `compression`
- Singleton Prisma client (une seule connexion partagée)

**Frontend**
- Server Components Next.js pour le rendu initial sans JavaScript client
- Données de fallback locales : la page s'affiche même si l'API est indisponible
- Revalidation ISR (60 secondes) pour les données publiques
- `Image` Next.js avec lazy loading et formats optimisés
- Service Worker (PWA) pour le cache des assets statiques

### 9.3 Résilience

- Si l'API est inaccessible (timeout 2,5 s), le frontend sert les données de fallback locales
- Health check endpoint (`GET /health`) pour les sondes de disponibilité
- Le service worker met en cache les ressources statiques pour une expérience offline partielle

---

## 10. Interface utilisateur et accessibilité

### 10.1 Pages de l'application web

| Route | Titre | Accès |
|-------|-------|-------|
| `/` | Accueil | Public |
| `/histoire` | Histoire paroissiale | Public |
| `/dirigeants` | Dirigeants religieux | Public |
| `/evenements` | Calendrier des événements | Public |
| `/annonces` | Annonces paroissiales | Public |
| `/communautes` | Communautés et mouvements | Public |
| `/catechese` | Gestion catéchétique | Authentifié |
| `/dashboard` | Dashboard administrateur | Authentifié (admin/catéchiste/resp) |
| `/auth/connexion` | Page de connexion | Public |
| `/auth/inscription` | Page d'inscription | Public |

### 10.2 Composants d'interface

**Layout**
- Header sticky avec navigation, toggle thème clair/sombre, avatar utilisateur, bouton connexion
- Footer avec navigation, coordonnées, liens sociaux
- Navigation mobile responsive avec menu hamburger

**Composants de section**
- `AnnouncementList` : grille 2 colonnes avec catégorie, date, auteur, compteurs
- `EventGrid` : grille 3 colonnes avec image, badge statut, lieu, date, inscrits
- `CommunityGrid` : cartes avec logo, mission, compteur membres
- `LeaderGrid` : cartes avec photo, biographie, années de service
- `HistoryTimeline` : frise chronologique avec médias
- `CatechesisBoard` : tableau de bord avec barres de progression, KPIs
- `DashboardClient` : grille de stats + graphique Recharts + audit trail

**Composants UI**
- `Button` : variants gold, outline, ghost, destructive — tailles sm, md, lg, icon
- `Card` / `CardHeader` / `CardContent` / `CardTitle`
- `Badge` : variants gold, muted, outline
- `Input`, `Textarea`
- `Progress` (barre de progression catéchétique)

### 10.3 Charte graphique

| Élément | Valeur |
|---------|--------|
| Couleur primaire | Bleu nuit — `hsl(211, 52%, 14%)` |
| Couleur accent (gold) | Doré — `hsl(39, 45%, 58%)` (#c8a45d) |
| Arrière-plan clair | Parchemin — `hsl(43, 45%, 96%)` |
| Police principale | Inter (sans-serif) |
| Police titres | Playfair Display (serif) |
| Thème sombre | Fond `hsl(212, 52%, 8%)`, texte ivoire `hsl(43, 45%, 94%)` |
| Mode sombre | Supporté via `next-themes` |

### 10.4 Progressive Web App (PWA)

- Manifest JSON avec icône, thème couleur, orientation portrait
- Service Worker pour cache des assets statiques
- `themeColor` : `#0d1b2a` (bleu nuit)
- Installation possible sur l'écran d'accueil des mobiles

### 10.5 Accessibilité

- Balises HTML sémantiques (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<aside>`)
- Attributs `aria-label` sur les boutons iconiques
- Contraste des couleurs conforme WCAG AA
- Navigation clavier opérationnelle
- `suppressHydrationWarning` sur `<html>` pour le changement de thème côté client
- Images avec attributs `alt` renseignés
- Taille minimale des zones tactiles : 40×40 px

---

## 11. Intégrations externes

### 11.1 Cloudinary (médias cloud)

| Paramètre | Détail |
|-----------|--------|
| Usage | Hébergement des images et médias lourds |
| Configuration | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Statut | Optionnel en v1 (fallback sur stockage local `/uploads`) |
| Données stockées | `cloudinaryPublicId`, `thumbnailUrl` dans `MediaAsset` |

### 11.2 SMTP / Emails transactionnels

| Paramètre | Détail |
|-----------|--------|
| Usage | Récupération de mot de passe, invitation de compte, notifications email |
| Configuration | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |
| Statut | Optionnel en v1 (route forgot-password fonctionne sans) |
| Bibliothèque | Nodemailer |

### 11.3 Notifications Push (PWA)

| Paramètre | Détail |
|-----------|--------|
| Usage | Alertes temps réel pour annonces, événements, rappels |
| Mécanisme | Web Push API via Service Worker |
| Statut | Prévu — infrastructure PWA en place, implémentation à compléter |

### 11.4 CalDAV / Calendrier externe

| Paramètre | Détail |
|-----------|--------|
| Usage | Synchronisation des événements paroissiaux vers Google Calendar, Apple Calendar |
| Statut | Hors périmètre v1 — prévu en v2 |

---

## 12. Déploiement et infrastructure

### 12.1 Environnements

| Environnement | Description | URL type |
|---------------|-------------|----------|
| Développement | Local, base de données locale | `localhost:3000` / `localhost:4000` |
| Staging | Pré-production, données de test | `staging.paroisse.example` |
| Production | Environnement live | `paroisse.example` |

### 12.2 Variables d'environnement requises

| Variable | Obligatoire | Description |
|----------|:-----------:|-------------|
| `DATABASE_URL` | ✓ | URL de connexion PostgreSQL |
| `JWT_ACCESS_SECRET` | ✓ | Secret access token (min. 24 car.) |
| `JWT_REFRESH_SECRET` | ✓ | Secret refresh token (min. 24 car.) |
| `API_PORT` | — | Port de l'API (défaut : 4000) |
| `API_URL` | — | URL publique de l'API |
| `WEB_URL` | — | URL publique du frontend |
| `CORS_ORIGINS` | — | Origines CORS autorisées (CSV) |
| `COOKIE_SECRET` | — | Secret pour les cookies signés |
| `BCRYPT_ROUNDS` | — | Rounds bcrypt (défaut : 12) |
| `RATE_LIMIT_WINDOW_MS` | — | Fenêtre rate limit en ms (défaut : 60000) |
| `RATE_LIMIT_MAX` | — | Max requêtes/fenêtre (défaut : 120) |
| `JWT_ACCESS_EXPIRES_IN` | — | Durée access token (défaut : 15m) |
| `JWT_REFRESH_EXPIRES_IN` | — | Durée refresh token (défaut : 7d) |
| `CLOUDINARY_CLOUD_NAME` | — | Intégration Cloudinary |
| `SMTP_HOST` | — | Serveur email |
| `NEXT_PUBLIC_API_URL` | ✓ (web) | URL API côté client |
| `NEXT_PUBLIC_SITE_URL` | — | URL site (metadata SEO) |

### 12.3 Pipeline CI/CD

Le projet intègre un pipeline GitHub Actions déclenché à chaque push / pull request sur `main` :

```
1. Provision PostgreSQL 16 (service GitHub Actions)
2. npm ci (installation des dépendances monorepo)
3. npm run db:generate (génération du client Prisma)
4. npm run build (compilation API TypeScript + build Next.js)
5. npm test (tests unitaires API + tests web)
```

### 12.4 Conteneurisation Docker

- `apps/api/Dockerfile` : image Node.js pour l'API
- `apps/web/Dockerfile` : image Node.js pour le frontend Next.js
- Configuration `.dockerignore` à la racine

### 12.5 Prérequis d'infrastructure

- Node.js ≥ 20.18.0, npm ≥ 10.0.0
- PostgreSQL 16 avec extension standard
- Stockage objet ou répertoire `/uploads` accessible en écriture pour l'API
- HTTPS obligatoire en production (cookies SameSite)

---

## 13. Tests et qualité

### 13.1 Stratégie de tests

| Niveau | Outil | Périmètre |
|--------|-------|-----------|
| Unitaires / Intégration API | Jest + Supertest | Routes, middleware, utilitaires |
| End-to-End frontend | Playwright | Parcours utilisateur critiques |
| Lint / Typage | TypeScript strict (`--noEmit`) | Tous les fichiers TypeScript |

### 13.2 Tests prioritaires à implémenter

**API (Jest + Supertest)**
- `POST /api/auth/register` : création compte, email dupliqué, validation schema
- `POST /api/auth/login` : succès, mauvais mot de passe, compte suspendu
- `POST /api/auth/refresh` : rotation token, token révoqué, token expiré
- `GET /api/announcements` : pagination, filtres, résultats publics uniquement
- `POST /api/announcements` : création avec auth, sans auth (401), sans rôle (403)
- `POST /api/events/:id/register` : inscription, double inscription (idempotent)
- `GET /api/analytics/dashboard` : accès admin OK, accès membre (403)
- `GET /health` : réponse 200 avec uptime

**Frontend (Playwright)**
- Parcours connexion → dashboard
- Parcours inscription → redirection
- Affichage de la page d'accueil avec données fallback
- Navigation mobile (menu hamburger)
- Toggle thème clair / sombre

### 13.3 Standards de code

- TypeScript strict activé (`strict: true`)
- Pas de `any` implicite
- Imports ESM uniquement (`.js` extensions dans les imports TypeScript)
- Séparation stricte router / validation / logique métier
- Gestion des erreurs via `asyncHandler` (pas de try/catch manuels dans les routes)
- Erreurs HTTP via `HttpError` (statusCode + message + details)

---

## 14. Évolutions futures

### Phase 2 — Fonctionnalités avancées

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| Refresh token en cookie HttpOnly | Haute | Finaliser la sécurité de la session |
| Email de récupération de mot de passe | Haute | Implémentation SMTP réelle avec token signé |
| Pages de détail annonces et événements | Haute | `/annonces/[slug]` et `/evenements/[slug]` |
| Middleware Next.js de protection de route | Haute | Vérification JWT côté serveur dans `middleware.ts` |
| Notifications push Web | Moyenne | Intégration Web Push API avec VAPID keys |
| Synchronisation CalDAV | Moyenne | Export vers Google Calendar, Apple Calendar |
| Galerie multimédia enrichie | Moyenne | Upload direct vers Cloudinary, lightbox |
| Interface d'administration CMS | Moyenne | CRUD complet pour tous les modules depuis le dashboard |

### Phase 3 — Extension de la plateforme

| Fonctionnalité | Description |
|----------------|-------------|
| Application mobile React Native | Version mobile native avec accès offline complet |
| Gestion financière | Suivi des offrandes, cotisations, dons |
| Streaming liturgique | Intégration YouTube Live / Vimeo dans les événements |
| Forum communautaire | Discussions thématiques par communauté |
| Multilinguisme | Interface en français, lingala, swahili |
| API webhooks | Notifications temps réel vers systèmes tiers |
| Tableau de bord financier | Revenus, dépenses, rapports paroissiaux |

---

## 15. Glossaire

| Terme | Définition |
|-------|------------|
| **Annonce** | Publication officielle de la paroisse diffusée à l'ensemble des fidèles ou à une communauté spécifique |
| **Audit trail** | Journal chronologique et immuable des actions réalisées sur la plateforme, permettant la traçabilité |
| **Catéchumène** | Personne en parcours d'initiation à la foi chrétienne, suivie individuellement par un catéchiste |
| **Communauté** | Mouvement, groupe ou association au sein de la paroisse (chorale, jeunesse, prière, service...) |
| **cuid** | Identifiant unique généré côté client, résistant aux collisions et adapté aux bases distribuées |
| **DRAFT** | Statut d'un contenu en cours de rédaction, non visible publiquement |
| **ISR** | Incremental Static Regeneration — regénération des pages Next.js à intervalles définis |
| **JWT** | JSON Web Token — format de jeton d'authentification signé numériquement |
| **Middleware** | Fonction Express exécutée dans la chaîne de traitement d'une requête (auth, validation...) |
| **ORM** | Object-Relational Mapping — couche d'abstraction entre le code et la base de données (Prisma) |
| **PWA** | Progressive Web App — application web installable avec fonctionnalités offline et push |
| **RBAC** | Role-Based Access Control — contrôle d'accès basé sur les rôles assignés à chaque utilisateur |
| **Refresh token** | Jeton longue durée permettant d'obtenir un nouvel access token sans re-saisir les identifiants |
| **Rythme sacré** | Parcours de formation catéchétique structuré en niveaux et leçons progressives |
| **Sacrements** | Actes liturgiques reçus par les catéchumènes (baptême, confirmation, eucharistie...) |
| **Slug** | Identifiant URL-friendly généré depuis le titre d'un contenu (ex: `messe-solennelle-abc1d2e`) |
| **super_admin** | Rôle système avec accès illimité, bypass de toutes les restrictions de rôle |
| **XSS** | Cross-Site Scripting — attaque par injection de code malveillant dans le navigateur |
| **Zod** | Bibliothèque TypeScript de validation et parsing de schémas de données |

---

*Document rédigé sur la base du code source de la version 0.1.0 du projet.*  
*Dernière mise à jour : Juin 2026*  
*Pour toute question : Bureau paroissial — contact@paroisse.local*
