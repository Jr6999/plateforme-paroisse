import { Church, Facebook, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export const Footer = () => (
  <footer className="border-t border-border bg-night text-ivory">
    <div className="container grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-night">
            <Church className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Paroisse Cathedrale</p>
            <p className="text-sm text-ivory/70">Plateforme communautaire et pastorale</p>
          </div>
        </div>
        <p className="max-w-xl text-sm leading-6 text-ivory/72">
          Un espace numerique pour preserver l'histoire, annoncer la vie paroissiale, coordonner les
          communautes et accompagner les catechumenes.
        </p>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gold">Navigation</h3>
        <div className="grid gap-2 text-sm text-ivory/72">
          <Link href="/histoire">Histoire</Link>
          <Link href="/evenements">Evenements</Link>
          <Link href="/annonces">Annonces</Link>
          <Link href="/catechese">Catechese</Link>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gold">Contact</h3>
        <div className="grid gap-2 text-sm text-ivory/72">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bureau paroissial</span>
          <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +243 000 000 000</span>
          <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@paroisse.local</span>
          <span className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Page officielle</span>
        </div>
      </div>
    </div>
  </footer>
);
