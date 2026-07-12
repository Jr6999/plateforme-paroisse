"use client";

import { useEffect, useRef } from "react";
import { restoreSession, useAuthStore } from "@/store/auth-store";

export const useSession = () => {
  const session = useAuthStore();
  const restored = useRef(false);

  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      restoreSession();
    }
  }, []);

  return session;
};
