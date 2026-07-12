import { CommunityGrid } from "@/components/sections/community-grid";
import { PageHeading } from "@/components/sections/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export const metadata = {
  title: "Communautes"
};

export default async function CommunitiesPage() {
  const communities = await api.communities();

  return (
    <>
      <PageHeading
        eyebrow="Mouvements et groupes"
        title="Communautés de la paroisse"
        description="Chaque communauté rassemble son histoire, sa mission, ses dirigeants, ses publications et son calendrier."
      />
      <section className="container grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card className="sticky top-24">
            <CardContent className="space-y-5 p-5">
              <Input placeholder="Rechercher une communauté…" />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catégories</p>
                <div className="flex flex-wrap gap-2">
                  {["Toutes", "Chorale", "Jeunesse", "Prière", "Service", "Formation"].map((c, i) => (
                    <Badge key={c} variant={i === 0 ? "gold" : "outline"} className="cursor-pointer">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {communities.items.length} communautés actives
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
        <CommunityGrid communities={communities.items} />
      </section>
    </>
  );
}
