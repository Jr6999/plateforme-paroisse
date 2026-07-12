import { AnnouncementList } from "@/components/sections/announcement-list";
import { PageHeading } from "@/components/sections/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export const metadata = {
  title: "Annonces paroissiales"
};

const CATEGORIES = ["Toutes", "Liturgie", "Catéchèse", "Communautés", "Administration", "Jeunesse", "Formation"];

export default async function AnnouncementsPage() {
  const announcements = await api.announcements();

  return (
    <>
      <PageHeading
        eyebrow="Communication"
        title="Annonces paroissiales"
        description="Publications, catégories, pièces jointes, commentaires et réactions. Restez informés de la vie de la paroisse."
      />
      <section className="container grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filtres */}
        <aside className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="space-y-5 p-5">
              <Input placeholder="Rechercher une annonce…" />

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catégories</p>
                <div className="grid gap-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {cat === "Toutes" && <Badge variant="gold" className="text-xs">Toutes</Badge>}
                      {cat !== "Toutes" && cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtres</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer">Épinglées</Badge>
                  <Badge variant="outline" className="cursor-pointer">Récentes</Badge>
                  <Badge variant="outline" className="cursor-pointer">Avec pièces jointes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Liste annonces */}
        <AnnouncementList announcements={announcements.items} />
      </section>
    </>
  );
}
