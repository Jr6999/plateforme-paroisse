import { CatechesisBoard } from "@/features/catechesis/catechesis-board";
import { PageHeading } from "@/components/sections/page-heading";
import { api } from "@/services/api";

export const metadata = {
  title: "Catechese"
};

export default async function CatechesisPage() {
  // Les données catéchumènes sont protégées côté API (requireAuth).
  // Sans token valide, api.catechumens() retourne les données de fallback.
  // La protection de navigation est assurée par src/middleware.ts.
  const [catechumens, rhythms] = await Promise.all([api.catechumens(), api.rhythms()]);

  return (
    <>
      <PageHeading
        eyebrow="Accompagnement"
        title="Gestion des catechumenes et rythmes sacres"
        description="Profils, progression, sacrements, presences aux cultes et formations, rapports et calendrier catechetique."
      />
      <section className="container py-14">
        <CatechesisBoard catechumens={catechumens.items} rhythms={rhythms.items} />
      </section>
    </>
  );
}
