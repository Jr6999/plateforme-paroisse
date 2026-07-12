import { CalendarRange } from "lucide-react";
import { EventGrid } from "@/components/sections/event-grid";
import { PageHeading } from "@/components/sections/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export const metadata = {
  title: "Evenements"
};

const STATUTS = ["Tous", "À venir", "En cours", "Terminés", "Annulés"];

export default async function EventsPage() {
  const events = await api.events();

  return (
    <>
      <PageHeading
        eyebrow="Agenda pastoral"
        title="Événements de la paroisse"
        description="Calendrier des célébrations, formations, retraites, rencontres communautaires et rappels."
      />
      <section className="container grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card className="sticky top-24">
            <CardContent className="space-y-5 p-5">
              <CalendarRange className="h-6 w-6 text-gold" />

              <Input placeholder="Rechercher un événement…" />

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</p>
                <div className="flex flex-wrap gap-2">
                  {STATUTS.map((s, i) => (
                    <Badge key={s} variant={i === 0 ? "gold" : "outline"} className="cursor-pointer">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Calendrier du mois courant */}
              {(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDay = new Date(year, month, 1).getDay();
                const offset = firstDay === 0 ? 6 : firstDay - 1;
                const monthName = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                return (
                  <div>
                    <p className="mb-2 text-xs font-semibold capitalize text-muted-foreground">{monthName}</p>
                    <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                      {["L","M","M","J","V","S","D"].map((d, i) => (
                        <span key={i} className="py-1 font-semibold text-muted-foreground">{d}</span>
                      ))}
                      {Array.from({ length: offset }).map((_, i) => <span key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <span
                          key={i}
                          className={`rounded-md py-1.5 text-xs ${i + 1 === today.getDate() ? "bg-gold font-semibold text-night" : "hover:bg-muted cursor-pointer"}`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </aside>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{events.items.length} événements</p>
          </div>
          <EventGrid events={events.items} />
        </div>
      </section>
    </>
  );
}
