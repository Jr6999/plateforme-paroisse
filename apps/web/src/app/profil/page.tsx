"use client";

import type React from "react";
import {
  User, Mail, Phone, MapPin, Shield, Calendar,
  Bell, BookOpen, Users, LogOut, Camera, Edit3
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { useAuthStore } from "@/store/auth-store";

const RECENT_ACTIVITY = [
  { id: "a1", action: "Inscription à Messe solennelle et procession", date: "06 juil. 2026" },
  { id: "a2", action: "Commentaire sur Neuvaine préparatoire", date: "03 juil. 2026" },
  { id: "a3", action: "Adhésion à Jeunesse Lumière", date: "28 juin 2026" }
];

export default function ProfilePage() {
  const { user } = useSession();
  const { logout } = useAuthStore();

  // Pas encore hydraté ou non connecté
  if (!user) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">Vous devez être connecté pour accéder à votre profil.</p>
            <Button asChild variant="gold">
              <Link href="/auth/connexion">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Avatar src={user.avatarUrl} name={user.name} size="xl" />
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-night shadow-md hover:bg-gold/90"
                aria-label="Modifier la photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-semibold">{user.name}</h1>
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((role) => (
                    <Badge key={role.key} variant="gold">{role.label}</Badge>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <Edit3 className="h-3.5 w-3.5" /> Modifier le profil
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Left col */}
        <div className="space-y-6">
          {/* Info personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-gold" /> Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow Icon={Mail} label="Email" value={user.email} />
              <InfoRow Icon={Shield} label="Rôle" value={user.roles?.map((r) => r.label).join(", ") ?? "Membre"} />
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader><CardTitle className="text-base">Activité récente</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: Calendar, label: "Inscriptions", value: 4 },
              { Icon: Users, label: "Communautés", value: 2 },
              { Icon: BookOpen, label: "Commentaires", value: 11 },
              { Icon: Bell, label: "Notifications", value: 3 }
            ].map(({ Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <Icon className="h-4 w-4 text-gold" />
                  <p className="mt-2 text-xl font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick links */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Liens rapides</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <Link href="/notifications" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" /> Mes notifications
              </Link>
              <Link href="/catechese" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                <BookOpen className="h-4 w-4" /> Suivi catéchétique
              </Link>
              <Link href="/messagerie" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                <Users className="h-4 w-4" /> Messagerie
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({
  Icon,
  label,
  value
}: {
  Icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
    <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);
