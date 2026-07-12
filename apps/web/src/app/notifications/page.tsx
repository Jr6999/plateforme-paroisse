"use client";

import type React from "react";
import { Bell, Megaphone, Calendar, Users, BookOpen, Settings, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "ANNOUNCEMENT" | "EVENT" | "COMMUNITY" | "CATECHESIS" | "SYSTEM";
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
};

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  ANNOUNCEMENT: Megaphone,
  EVENT: Calendar,
  COMMUNITY: Users,
  CATECHESIS: BookOpen,
  SYSTEM: Settings
};

const TYPE_LABELS: Record<string, string> = {
  ANNOUNCEMENT: "Annonce",
  EVENT: "Événement",
  COMMUNITY: "Communauté",
  CATECHESIS: "Catéchèse",
  SYSTEM: "Système"
};

const SAMPLE: Notification[] = [
  { id: "n1", type: "ANNOUNCEMENT", title: "Nouvelle annonce publiée", body: "Neuvaine préparatoire à la solennité du Saint Sacrement", link: "/annonces/neuvaine-saint-sacrement", createdAt: "2026-07-06T08:30:00Z" },
  { id: "n2", type: "EVENT", title: "Rappel événement", body: "Messe solennelle et procession — demain à 08h00", link: "/evenements/messe-solennelle-procession", createdAt: "2026-07-05T20:00:00Z" },
  { id: "n3", type: "COMMUNITY", title: "Activité dans votre communauté", body: "Jeunesse Lumière a publié une nouvelle annonce", link: "/communautes/jeunesse-lumiere", createdAt: "2026-07-05T14:20:00Z", readAt: "2026-07-05T15:00:00Z" },
  { id: "n4", type: "CATECHESIS", title: "Mise à jour catéchétique", body: "Votre progression a été enregistrée pour Niveau 1", createdAt: "2026-07-04T10:00:00Z", readAt: "2026-07-04T10:30:00Z" },
  { id: "n5", type: "SYSTEM", title: "Bienvenue sur la plateforme", body: "Votre compte a été activé avec succès.", createdAt: "2026-07-01T09:00:00Z", readAt: "2026-07-01T09:30:00Z" }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)
    );

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Bell className="h-6 w-6 text-gold" /> Notifications
            {unreadCount > 0 && (
              <Badge variant="gold">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</Badge>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-3.5 w-3.5" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = TYPE_ICONS[notif.type] ?? Bell;
          const isUnread = !notif.readAt;
          return (
            <Card
              key={notif.id}
              className={cn("cursor-pointer transition hover:shadow-md", isUnread && "border-gold/40 bg-gold/5")}
              onClick={() => markRead(notif.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isUnread ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", isUnread && "font-semibold")}>{notif.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="muted" className="text-xs">{TYPE_LABELS[notif.type]}</Badge>
                    {notif.link && (
                      <Link href={notif.link} className="text-xs text-gold hover:underline">
                        Voir →
                      </Link>
                    )}
                    {isUnread && (
                      <span className="ml-auto inline-block h-2 w-2 rounded-full bg-gold" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
