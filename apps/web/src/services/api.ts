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

const configuredApiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const API_URL =
  configuredApiUrl ?? (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4000/api");

async function getJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (!API_URL) return fallback;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      next: { revalidate: 60 }
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  announcements: () =>
    getJson<ApiList<Announcement>>("/announcements?limit=8", {
      items: fallbackAnnouncements
    }),
  events: () => getJson<ApiList<Event>>("/events?limit=8", { items: fallbackEvents }),
  communities: () =>
    getJson<ApiList<Community>>("/communities?limit=8", { items: fallbackCommunities }),
  leaders: () => getJson<ApiList<Leader>>("/leaders?limit=12", { items: fallbackLeaders }),
  history: () => getJson<ApiList<HistoryItem>>("/history?limit=20", { items: fallbackHistory }),
  catechumens: (token?: string) =>
    getJson<ApiList<Catechumen>>(
      "/catechumens?limit=10",
      { items: fallbackCatechumens },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),
  rhythms: () => getJson<ApiList<SacredRhythm>>("/sacred-rhythms?limit=8", { items: fallbackRhythms }),
  dashboard: (token?: string) =>
    getJson<DashboardStats>(
      "/analytics/dashboard",
      fallbackDashboard,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
};
