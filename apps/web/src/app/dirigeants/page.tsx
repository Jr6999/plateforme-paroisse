import { LeaderGrid } from "@/components/sections/leader-grid";
import { PageHeading } from "@/components/sections/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export const metadata = {
  title: "Dirigeants religieux"
};

const ROLES = ["Tous", "Curé", "Évêque", "Vicaire", "Diacre", "Responsable"];

export default async function LeadersPage() {
  const leaders = await api.leaders();

  return (
    <>
      <PageHeading
        eyebrow="Gouvernance pastorale"
        title="Nos dirigeants"
        description="Ceux qui ont guidé notre paroisse. Profils, biographies, années de service et mémoire pastorale."
      />
      <section className="container grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card className="sticky top-24">
            <CardContent className="space-y-5 p-5">
              <Input placeholder="Rechercher un dirigeant…" />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rôle</p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r, i) => (
                    <Badge key={r} variant={i === 0 ? "gold" : "outline"} className="cursor-pointer">{r}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
        <LeaderGrid leaders={leaders.items} />
      </section>
    </>
  );
}
