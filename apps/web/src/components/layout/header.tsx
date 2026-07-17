"use client";

import { Bell, Church, Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { SearchDialog } from "./search-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

const navItems = [
  ["Accueil", "/"],
  ["Histoire", "/histoire"],
  ["Dirigeants", "/dirigeants"],
  ["Événements", "/evenements"],
  ["Annonces", "/annonces"],
  ["Communautés", "/communautes"],
  ["Catéchèse", "/catechese"],
  ["Médias", "/medias"],
  ["Contact", "/contact"]
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useSession();
  const pathname = usePathname();

  return (
    <>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
              <Church className="h-4 w-4" />
            </span>
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-sm font-semibold">Cathédrale Saint Sauveur</span>
              <span className="truncate text-xs text-muted-foreground">Natitingou • Bénin</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map(([label, href]) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition",
                    active ? "text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Recherche" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Changer le thème"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>
            {user ? (
              <>
                <Button asChild variant="ghost" size="icon" aria-label="Notifications">
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
                <Link href="/profil" className="hidden sm:block">
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </Link>
                <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/connexion">Connexion</Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className={cn("border-t border-border bg-background lg:hidden", menuOpen ? "block" : "hidden")}>
          <nav className="container grid gap-0.5 py-3">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/auth/connexion"
                className="mt-2 rounded-lg bg-gold px-3 py-2.5 text-center text-sm font-medium text-night"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};
