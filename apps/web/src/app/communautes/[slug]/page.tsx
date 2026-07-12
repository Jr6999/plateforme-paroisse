import type React from "react";
import { Calendar, Megaphone, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AnnouncementList } from "@/components/sections/announcement-list";
import { EventGrid } from "@/components/sections/event-grid";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

async function getCommunity(slug: string) {
  try {
    const res = await fetch(`${API_URL}/communities/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()).community;
  } catch { return null; }
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await getCommunity(slug);
  if (!community) notFound();

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-64 bg-night md:h-80">
        {community.coverImageUrl && (
          <Image src={community.coverImageUrl} alt={community.name} fill className="object-cover opacity-60" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
        <div className="container absolute bottom-6 left-0 right-0 flex items-end gap-5">
          {community.logoUrl && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-gold bg-muted">
              <Image src={community.logoUrl} alt={community.name} fill className="object-cover" sizes="64px" />
            </div>
          )}
          <div className="text-ivory">
            <h1 className="font-serif text-3xl font-semibold">{community.name}</h1>
            {community.coordinator && (
              <p className="mt-1 text-sm text-ivory/70">Coordinateur : {community.coordinator.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-border bg-card">
        <div className="container flex flex-wrap gap-8 py-4">
          <StatItem Icon={Users} label="Membres" value={community._count?.members ?? 0} />
          <StatItem Icon={Calendar} label="Événements" value={community._count?.events ?? 0} />
          <StatItem Icon={Megaphone} label="Annonces" value={community._count?.announcements ?? 0} />
        </div>
      </div>

      {/* Content */}
      <div className="container py-10 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
        <div className="space-y-10">
          {/* Story & mission */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base text-gold">Notre histoire</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{community.story}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base text-gold">Notre mission</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{community.mission}</p></CardContent>
            </Card>
          </div>

          {/* Events */}
          {community.events?.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-semibold">Événements</h2>
              <EventGrid events={community.events} />
            </div>
          )}

          {/* Announcements */}
          {community.announcements?.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-semibold">Annonces</h2>
              <AnnouncementList announcements={community.announcements} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <Button variant="gold" className="w-full">Rejoindre la communauté</Button>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader><CardTitle className="text-base">Membres ({community._count?.members ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {community.members?.slice(0, 8).map((m: { user: { id: string; name: string; avatarUrl?: string }; role: string }) => (
                <div key={m.user.id} className="flex items-center gap-3">
                  <Avatar src={m.user.avatarUrl} name={m.user.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{m.user.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Link href="/communautes" className="text-sm font-medium text-gold hover:underline">← Toutes les communautés</Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

const StatItem = ({ Icon, label, value }: { Icon: React.FC<{ className?: string }>; label: string; value: number }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="h-4 w-4 text-gold" />
    <span className="font-semibold">{value}</span>
    <span className="text-muted-foreground">{label}</span>
  </div>
);
