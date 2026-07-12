"use client";

import { Activity, Bell, CalendarDays, CheckCircle2, ClipboardList, Megaphone, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

const ATTENDANCE_COLORS: Record<string, string> = {
  PRESENT: "#22c55e",
  ABSENT: "#ef4444",
  EXCUSED: "#f59e0b",
  LATE: "#6366f1"
};

const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: "Présents",
  ABSENT: "Absents",
  EXCUSED: "Excusés",
  LATE: "En retard"
};

const ACTION_LABELS: Record<string, string> = {
  "announcement.create": "Annonce créée",
  "announcement.update": "Annonce modifiée",
  "announcement.archive": "Annonce archivée",
  "attendance.create": "Présence enregistrée",
  "event.create": "Événement créé",
  "catechumen.create": "Catéchumène ajouté",
  "auth.register": "Inscription",
  "auth.login": "Connexion"
};

export const DashboardClient = ({ data }: { data: DashboardStats }) => {
  const statCards = [
    { label: "Utilisateurs inscrits", value: data.stats.users, Icon: Users, href: "/dashboard/utilisateurs", color: "text-blue-500" },
    { label: "Annonces publiées", value: data.stats.announcements, Icon: Megaphone, href: "/annonces", color: "text-purple-500" },
    { label: "Événements", value: data.stats.events, Icon: CalendarDays, href: "/evenements", color: "text-orange-500" },
    { label: "À venir (30j)", value: data.stats.upcomingEvents, Icon: Bell, href: "/evenements", color: "text-yellow-500" },
    { label: "Communautés actives", value: data.stats.communities, Icon: Activity, href: "/communautes", color: "text-green-500" },
    { label: "Catéchumènes actifs", value: data.stats.catechumens, Icon: ShieldCheck, href: "/catechese", color: "text-gold" }
  ];

  const attendanceData = data.attendanceStats.map((s) => ({
    ...s,
    label: ATTENDANCE_LABELS[s.status] ?? s.status
  }));

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ label, value, Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="cursor-pointer transition hover:shadow-md hover:border-gold/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <Badge variant="muted" className="text-xs">↗</Badge>
                </div>
                <p className="mt-4 text-3xl font-semibold">{value.toLocaleString("fr-FR")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts + Audit */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Attendance chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              Présence catéchétique (90 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [value, "Enregistrements"]}
                />
                <Bar dataKey="_count" radius={[6, 6, 0, 0]}>
                  {attendanceData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={ATTENDANCE_COLORS[entry.status] ?? "#c8a45d"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audit trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-gold" />
              Journal d'audit récent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentAudit.map((log) => (
              <div key={log.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  <Badge variant="muted" className="shrink-0 text-xs">{log.entity}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.user?.name && <span>{log.user.name} · </span>}
                  {new Date(log.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            ))}
            {data.recentAudit.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucun journal disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm"><Link href="/annonces">Publier une annonce</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/evenements">Créer un événement</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/catechese">Gérer les catéchumènes</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/communautes">Voir les communautés</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};
