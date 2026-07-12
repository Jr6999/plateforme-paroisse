import { ArrowRight, BookOpen, CalendarDays, Church, HeartHandshake, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnnouncementList } from "@/components/sections/announcement-list";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CommunityGrid } from "@/components/sections/community-grid";
import { EventGrid } from "@/components/sections/event-grid";
import { HistoryTimeline } from "@/components/sections/history-timeline";
import { LeaderGrid } from "@/components/sections/leader-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";

export default async function HomePage() {
  const [announcements, events, communities, leaders, history] = await Promise.all([
    api.announcements(),
    api.events(),
    api.communities(),
    api.leaders(),
    api.history()
  ]);

  const stats = [
    ["3 568", "Fidèles inscrits"],
    ["12", "Communautés actives"],
    ["68+", "Ans d'histoire"],
    ["256", "Catéchumènes"]
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1800&q=80"
            alt="Cathédrale illuminée"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
        </div>
        <div className="container relative grid min-h-[calc(100svh-4rem)] items-center gap-10 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <Badge variant="gold">Plateforme pastorale moderne</Badge>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
              Bienvenue à la<br />Paroisse Cathédrale
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ivory/75">
              Une communauté vivante de foi, d'espérance et d'amour. Un espace numérique pour raconter l'histoire, annoncer et unir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/annonces">
                  Découvrir la paroisse <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ivory/30 bg-ivory/10 text-ivory hover:bg-ivory/16">
                <Link href="/evenements">Voir les événements</Link>
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Prochaine célébration", value: "Messe solennelle", Icon: CalendarDays },
                { label: "Rythme sacré", value: "Initiation à la foi", Icon: BookOpen },
                { label: "Communautés", value: "Chorale, jeunesse, prière", Icon: Users },
                { label: "Service", value: "Charité et accompagnement", Icon: HeartHandshake }
              ].map(({ label, value, Icon }) => (
                <div key={label} className="rounded-xl border border-white/14 bg-white/10 p-4">
                  <Icon className="h-5 w-5 text-gold" />
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ivory/55">{label}</p>
                  <p className="mt-2 font-medium text-ivory">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <AnimatedSection className="border-b border-border bg-background">
        <div className="container grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <Card key={label}>
              <CardContent className="p-5">
                <p className="text-3xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>

      {/* PROCHAINS ÉVÉNEMENTS */}
      <AnimatedSection className="container py-14">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="gold">Agenda</Badge>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Prochains événements</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/evenements">Voir tout</Link>
          </Button>
        </div>
        <EventGrid events={events.items.slice(0, 3)} />
      </AnimatedSection>

      {/* ANNONCES RÉCENTES */}
      <AnimatedSection className="bg-muted/40 py-14">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="gold">Actualité</Badge>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Annonces récentes</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/annonces">Découvrir toutes les annonces</Link>
            </Button>
          </div>
          <AnnouncementList announcements={announcements.items.slice(0, 4)} />
        </div>
      </AnimatedSection>

      {/* HISTOIRE PAROISSIALE — timeline compacte */}
      <AnimatedSection className="container py-14">
        <div className="mb-8">
          <Badge variant="gold">Mémoire</Badge>
          <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Histoire de notre paroisse</h2>
        </div>
        {/* Frise chronologique horizontale */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex min-w-max gap-0">
            {history.items.slice(0, 5).map((item, i) => (
              <div key={item.id} className="relative flex-1 min-w-36 pr-8">
                {/* Line */}
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-gold ring-4 ring-gold/20" />
                  {i < 4 && <div className="h-px flex-1 bg-border" />}
                </div>
                {/* Content */}
                <div className="mt-4 pr-4">
                  <p className="text-xs font-bold text-gold">
                    {item.occurredAt ? new Date(item.occurredAt).getFullYear() : item.period}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-5">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/histoire">Découvrir toute l'histoire</Link>
          </Button>
        </div>
      </AnimatedSection>

      {/* DIRIGEANTS */}
      <AnimatedSection className="bg-muted/40 py-14">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="gold">Gouvernance</Badge>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Nos dirigeants</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/dirigeants">Voir tous nos dirigeants</Link>
            </Button>
          </div>
          <LeaderGrid leaders={leaders.items.slice(0, 3)} />
        </div>
      </AnimatedSection>

      {/* COMMUNAUTÉS */}
      <AnimatedSection className="bg-night py-14 text-ivory">
        <div className="container grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <Badge variant="gold">Vie communautaire</Badge>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Mouvements et groupes</h2>
            <p className="mt-4 text-sm leading-6 text-ivory/72">
              Chaque communauté dispose de son histoire, ses dirigeants, ses événements, ses membres et ses publications internes.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link href="/communautes">Rejoindre une communauté</Link>
            </Button>
          </div>
          <CommunityGrid communities={communities.items.slice(0, 2)} />
        </div>
      </AnimatedSection>

      {/* CITATION + CTA */}
      <section className="container py-14">
        <Card className="overflow-hidden bg-primary text-primary-foreground">
          <CardContent className="grid gap-6 p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Church className="h-10 w-10 text-gold" />
            <div>
              <p className="font-serif text-2xl font-semibold">«Que tout se fasse avec bienséance et avec ordre.»</p>
              <p className="mt-2 text-sm text-primary-foreground/70">1 Corinthiens 14, 40</p>
            </div>
            <Button asChild variant="gold" size="lg">
              <Link href="/dashboard">Accéder au dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
