"use client";

import {
  Bell,
  BookOpen,
  Church,
  Clock,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  Users,
  Calendar,
  Scroll,
  Crown,
  User,
  LogOut
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const navGroups = [
  {
    items: [
      { label: "Accueil", href: "/", Icon: Church },
      { label: "Annonces", href: "/annonces", Icon: Megaphone },
      { label: "Événements", href: "/evenements", Icon: Calendar },
      { label: "Communautés", href: "/communautes", Icon: Users },
      { label: "Catéchèse", href: "/catechese", Icon: BookOpen },
      { label: "Histoire", href: "/histoire", Icon: Scroll },
      { label: "Dirigeants", href: "/dirigeants", Icon: Crown },
      { label: "Médias", href: "/medias", Icon: Clock },
      { label: "Messagerie", href: "/messagerie", Icon: MessageSquare },
      { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
      { label: "Profil", href: "/profil", Icon: User },
      { label: "Paramètres", href: "/parametres", Icon: Settings }
    ]
  }
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-night text-ivory lg:flex">
      {/* Logo — Cathédrale Saint Sauveur */}
      <Link
        href="/"
        className="group block border-b border-white/10 p-4"
        aria-label="Cathédrale Saint Sauveur de Natitingou — Accueil"
      >
        <div className="overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/cathedrale.jpg"
              alt="Cathédrale Saint Sauveur de Natitingou"
              fill
              className="object-cover"
              sizes="224px"
              priority
            />
          </div>
        </div>
        <div className="mt-3 px-1">
          <p className="text-sm font-semibold leading-snug text-ivory">
            Cathédrale Saint Sauveur de Natitingou
          </p>
          <p className="mt-0.5 text-xs text-ivory/55">Natitingou • Bénin</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navGroups[0].items.map(({ label, href, Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-gold/20 text-gold"
                  : "text-ivory/70 hover:bg-white/8 hover:text-ivory"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Citation */}
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs italic leading-5 text-ivory/50">
          « Soyez dans la joie du Seigneur tous les jours »
        </p>
        <p className="mt-1 text-xs text-ivory/35">Philippiens 4,4</p>
      </div>

      {/* Logout */}
      {user && (
        <div className="border-t border-white/10 px-3 py-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 transition hover:bg-white/8 hover:text-ivory"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
};
