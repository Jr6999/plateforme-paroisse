import { HistoryTimeline } from "@/components/sections/history-timeline";
import { PageHeading } from "@/components/sections/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export const metadata = {
  title: "Histoire"
};

const TYPES = ["Tous", "Fondation", "Rénovation", "Archive", "Célébration", "Transformation"];

export default async function HistoryPage() {
  const history = await api.history();

  return (
    <>
      <PageHeading
        eyebrow="Mémoire paroissiale"
        title="Histoire de notre paroisse"
        description="Timeline de la fondation à aujourd'hui. Archives, documents et témoignages de 68+ ans de vie paroissiale."
      />
      <section className="container grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card className="sticky top-24">
            <CardContent className="space-y-5 p-5">
              <Input placeholder="Rechercher dans l'histoire…" />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t, i) => (
                    <Badge key={t} variant={i === 0 ? "gold" : "outline"} className="cursor-pointer">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Périodes clés</p>
                {[
                  { year: "1956", label: "Fondation" },
                  { year: "1964", label: "Construction du clocher" },
                  { year: "1985", label: "Extension de la cathédrale" },
                  { year: "2000", label: "Année du Jubilé" },
                  { year: "2026", label: "Transformation numérique" }
                ].map(({ year, label }) => (
                  <div key={year} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted cursor-pointer">
                    <span className="w-10 shrink-0 text-xs font-bold text-gold">{year}</span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
        <HistoryTimeline items={history.items} />
      </section>
    </>
  );
}
