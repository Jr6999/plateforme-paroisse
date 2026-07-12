"use client";

import { create } from "zustand";

type Role = { key: string; label: string };

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: Role[];
};

type AuthState = {
  user?: SessionUser;
  /** accessToken conservé uniquement en mémoire (jamais persisté) */
  accessToken?: string;
  setSession: (session: { user: SessionUser; accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
};

const USER_KEY = "paroisse.user";
const SESSION_COOKIE = "paroisse.session";

/** Pose un cookie de présence (non sensible) utilisable par le middleware SSR */
function setSessionCookie(value: string) {
  if (typeof document === "undefined") return;
  const maxAge = 7 * 24 * 60 * 60; // 7 jours
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>((set) => ({
  setSession: ({ user, accessToken }) => {
    if (typeof window !== "undefined") {
      // Stocke uniquement le profil (jamais les tokens)
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Cookie de présence pour le middleware Next.js
      setSessionCookie("1");
    }
    set({ user, accessToken });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
      clearSessionCookie();
    }
    set({ user: undefined, accessToken: undefined });
  }
}));

/**
 * Restaure uniquement le profil utilisateur depuis localStorage.
 * Le accessToken reste vide jusqu'à un vrai refresh via /auth/refresh.
 */
export const restoreSession = () => {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return;
  try {
    const user = JSON.parse(raw) as SessionUser;
    // Ne touche pas à l'accessToken — il doit être re-obtenu via /auth/refresh
    useAuthStore.setState({ user });
  } catch {
    localStorage.removeItem(USER_KEY);
    clearSessionCookie();
  }
};
