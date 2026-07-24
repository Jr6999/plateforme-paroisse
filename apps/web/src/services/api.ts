/**
 * Service API — Cathédrale Saint Sauveur de Natitingou
 *
 * Toutes les routes backend sont montées sur /api (ex: GET /api/events).
 * NEXT_PUBLIC_API_URL doit inclure le préfixe /api.
 * Exemple production : https://plateforme-paroisse.onrender.com/api
 * Exemple local      : http://127.0.0.1:4000/api
 *
 * En cas d'échec de l'appel (timeout, 4xx, 5xx, réseau),
 * les données de fallback statiques sont retournées silencieusement
 * pour garantir le rendu de la page même sans backend.
 */

import {
  fallbackAnnouncements,
  fallbackCatechumens,
  fallbackCommunities,
  fallbackDashboard,
  fallbackEvents,
  fallbackHistory,
  fallbackLeaders,
  fallbackRhythms
} from "@/lib/data";
import type {
  Announcement,
  ApiList,
  Catechumen,
  Community,
  DashboardStats,
  Event,
  HistoryItem,
  Leader,
  SacredRhythm
} from "@/types";

// ── Résolution de l'URL de base ───────────────────────────────────────────────
//
// Priorité :
//   1. API_URL       — variable serveur Next.js (SSR, Server Components)
//   2. NEXT_PUBLIC_API_URL — variable publique (SSR + Client)
//   3. Fallback développement local
//
// IMPORTANT : Ces variables DOIVENT inclure le préfixe /api
//   ✅ Correct   : https://plateforme-paroisse.onrender.com/api
//   ❌ Incorrect : https://plateforme-paroisse.onrender.com
//
function resolveApiUrl(): string {
  // Côté serveur (Server Components, SSR)
  const serverUrl = process.env.API_URL;
  if (serverUrl) return serverUrl.replace(/\/$/, ""); // supprimer slash final si présent

  // Côté client ou fallback SSR
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl) return publicUrl.replace(/\/$/, "");

  // Fallback développement uniquement
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:4000/api";
  }

  // En production sans variable configurée — log d'avertissement
  console.warn(
    "[API] NEXT_PUBLIC_API_URL non configurée. " +
    "Configurez cette variable dans Render → Environment. " +
    "Valeur attendue : https://plateforme-paroisse.onrender.com/api"
  );
  return "";
}

const BASE_URL = resolveApiUrl();

// ── Fonction utilitaire fetch avec timeout et fallback ────────────────────────

async function getJson<T>(
  path: string,
  fallback: T,
  init?: RequestInit
): Promise<T> {
  if (!BASE_URL) {
    console.warn(`[API] URL de base non configurée — retour fallback pour : ${path}`);
    return fallback;
  }

  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  // Timeout plus généreux en production (Render cold start peut prendre 5-10s)
  const timeoutMs = process.env.NODE_ENV === "production" ? 8000 : 3000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      // Revalidation toutes les 60s pour les Server Components Next.js
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.warn(`[API] ${response.status} ${response.statusText} — GET ${url}`);
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[API] Timeout (${timeoutMs}ms) — GET ${url}`);
    } else {
      console.warn(`[API] Erreur réseau — GET ${url}`, error instanceof Error ? error.message : error);
    }
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Endpoints publics (sans authentification) ────────────────────────────────

export const api = {
  /**
   * GET /api/announcements?limit=8&status=PUBLISHED
   */
  announcements: () =>
    getJson<ApiList<Announcement>>(
      "/announcements?limit=8&status=PUBLISHED",
      { items: fallbackAnnouncements }
    ),

  /**
   * GET /api/events?limit=8
   */
  events: () =>
    getJson<ApiList<Event>>(
      "/events?limit=8",
      { items: fallbackEvents }
    ),

  /**
   * GET /api/communities?limit=8
   */
  communities: () =>
    getJson<ApiList<Community>>(
      "/communities?limit=8",
      { items: fallbackCommunities }
    ),

  /**
   * GET /api/leaders?limit=12
   */
  leaders: () =>
    getJson<ApiList<Leader>>(
      "/leaders?limit=12",
      { items: fallbackLeaders }
    ),

  /**
   * GET /api/history?limit=20
   */
  history: () =>
    getJson<ApiList<HistoryItem>>(
      "/history?limit=20",
      { items: fallbackHistory }
    ),

  /**
   * GET /api/catechumens?limit=10
   * Requiert un JWT valide (route protégée)
   */
  catechumens: (token?: string) =>
    getJson<ApiList<Catechumen>>(
      "/catechumens?limit=10",
      { items: fallbackCatechumens },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),

  /**
   * GET /api/sacred-rhythms?limit=8
   */
  rhythms: () =>
    getJson<ApiList<SacredRhythm>>(
      "/sacred-rhythms?limit=8",
      { items: fallbackRhythms }
    ),

  /**
   * GET /api/analytics/dashboard
   * Requiert un JWT valide (route protégée — admin/catéchiste)
   */
  dashboard: (token?: string) =>
    getJson<DashboardStats>(
      "/analytics/dashboard",
      fallbackDashboard,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),

  /**
   * GET /api/search?q=terme
   */
  search: (q: string) =>
    getJson<{
      announcements: Announcement[];
      events: Event[];
      communities: Community[];
      history: HistoryItem[];
    }>(
      `/search?q=${encodeURIComponent(q)}`,
      { announcements: [], events: [], communities: [], history: [] }
    ),

  /**
   * GET /api/announcements/:slug
   */
  announcement: (slug: string) =>
    getJson<{ announcement: Announcement }>(
      `/announcements/${encodeURIComponent(slug)}`,
      { announcement: fallbackAnnouncements[0] }
    ),

  /**
   * GET /api/events/:slug
   */
  event: (slug: string) =>
    getJson<{ event: Event }>(
      `/events/${encodeURIComponent(slug)}`,
      { event: fallbackEvents[0] }
    ),

  /**
   * GET /api/communities/:slug
   */
  community: (slug: string) =>
    getJson<{ community: Community }>(
      `/communities/${encodeURIComponent(slug)}`,
      { community: fallbackCommunities[0] }
    )
};

// ── Export de l'URL de base pour utilisation côté client ─────────────────────
export { BASE_URL as apiBaseUrl };
