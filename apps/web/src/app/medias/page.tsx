import { PageHeading } from "@/components/sections/page-heading";
import { MediasTabs } from "@/features/medias/medias-tabs";

export const metadata = { title: "Médias" };

export default function MediasPage() {
  return (
    <>
      <PageHeading
        eyebrow="Multimédia"
        title="Médias et galeries"
        description="Retrouvez nos homélies, vidéos, photos et podcasts. Bienvenue dans notre espace multimédia."
      />
      <section className="container py-14">
        <MediasTabs />
      </section>
    </>
  );
}
