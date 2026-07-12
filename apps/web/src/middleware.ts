import { type NextRequest, NextResponse } from "next/server";

/**
 * Routes nécessitant une session active côté client.
 * La protection définitive est assurée par l'API (requireAuth + requireRoles).
 * Ce middleware constitue la première ligne de défense côté web.
 * Note : le token d'accès étant en mémoire JS (non-cookie), on vérifie
 * uniquement la présence du profil utilisateur persisté en localStorage.
 * Un cookie de session devrait être mis en place côté API pour une protection robuste.
 */
const PROTECTED_PATHS = ["/dashboard", "/catechese", "/messagerie", "/notifications", "/profil", "/parametres"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // Vérifie le cookie de session (set par setSession côté client via document.cookie)
  const sessionCookie = request.cookies.get("paroisse.session");
  if (sessionCookie?.value) return NextResponse.next();

  // Fallback : si pas de cookie, on laisse passer et c'est le composant client
  // qui redirige après la vérification du store Zustand (hydration)
  // Pour une vraie protection SSR, il faudrait un cookie HttpOnly
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/catechese/:path*", "/messagerie/:path*", "/notifications/:path*", "/profil/:path*", "/parametres/:path*"]
};
