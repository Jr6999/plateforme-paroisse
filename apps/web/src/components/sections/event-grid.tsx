import { CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  LIVE: "En cours",
  SCHEDULED: "À venir",
  DRAFT: "Brouillon",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé"
};

export const EventGrid = ({ events }: { events: Event[] }) => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {events.map((event) => (
      <Card key={event.id} className="overflow-hidden">
        <div className="relative aspect-[16/10] bg-muted">
          {event.coverImageUrl && (
            <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          )}
          <Badge className="absolute left-3 top-3" variant="gold">
            {STATUS_LABELS[event.status] ?? event.status}
          </Badge>
        </div>
        <CardContent className="space-y-4 pt-5">
          <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{event.description}</p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(event.startAt)}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {event._count?.registrations ?? 0} inscrits</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
