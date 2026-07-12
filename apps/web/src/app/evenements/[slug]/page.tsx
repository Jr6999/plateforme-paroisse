import { CalendarDays, MapPin, Users, ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  LIVE: "En cours",
  SCHEDULED: "À venir",
  DRAFT: "Brouillon",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé"
};

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).event;
  } catch { return null; }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  return (
    <div className="container py-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
      {/* Main */}
      <div className="min-w-0 space-y-8">
        {/* Cover */}
        {event.coverImageUrl && (
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
            <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 700px" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {event.category && (
                <Badge style={{ backgroundColor: `${event.category.color}22`, color: event.category.color }}>
                  {event.category.name}
                </Badge>
              )}
              <Badge variant="gold">{STATUS_LABELS[event.status] ?? event.status}</Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl font-semibold leading-tight">{event.title}</h1>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {formatDate(event.startAt)}{event.endAt && ` – ${formatDate(event.endAt)}`}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {event.location}</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> {event._count?.registrations ?? 0} inscrits{event.capacity ? ` / ${event.capacity} places` : ""}</span>
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap leading-7">{event.description}</p>
        </div>

        {/* Gallery */}
        {event.galleryItems?.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Galerie</h2>
            <div className="grid grid-cols-3 gap-3">
              {event.galleryItems.map((media: { id: string; url: string; title: string }) => (
                <div key={media.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image src={media.url} alt={media.title} fill className="object-cover" sizes="33vw" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrants preview */}
        {event.registrations?.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Participants</h2>
            <div className="flex -space-x-2">
              {event.registrations.slice(0, 8).map((reg: { user: { id: string; name: string; avatarUrl?: string } }) => (
                <Avatar key={reg.user.id} src={reg.user.avatarUrl} name={reg.user.name} size="md" className="ring-2 ring-background" />
              ))}
              {event.registrations.length > 8 && (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
                  +{event.registrations.length - 8}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <Button asChild variant="gold" className="w-full" size="lg">
              <Link href={event.registrationUrl ?? "#"}>
                S'inscrire à cet événement
              </Link>
            </Button>
            {event.livestreamUrl && (
              <Button asChild variant="outline" className="w-full" size="lg">
                <a href={event.livestreamUrl} target="_blank" rel="noreferrer">
                  <Play className="h-4 w-4" /> Suivre en direct
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDate(event.startAt)}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{event.location}</div>
            {event.capacity && <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Capacité : {event.capacity} personnes</div>}
            {event.community && (
              <Link href={`/communautes/${event.community.slug}`} className="block pt-2 text-gold hover:underline">
                {event.community.name}
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Link href="/evenements" className="text-sm font-medium text-gold hover:underline">← Retour aux événements</Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
