import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => (
  <footer className="border-t border-border bg-night text-ivory">
    <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
      {/* Branding */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
            <Image
              src="/images/cathedrale.jpg"
              alt="Cathédrale Saint Sauveur de Natitingou"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <p className="font-semibold leading-snug">Cathédrale Saint Sauveur</p>
            <p className="text-xs text-ivory/60">Natitingou • Bénin</p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-6 text-ivory/72">
          Un espace numérique pour préserver l'histoire, annoncer la vie paroissiale,
          coordonner les communautés et accompagner les catéchumènes.
        </p>
      </div>

      {/* Navigation */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gold">Navigation</h3>
        <div className="grid gap-2 text-sm text-ivory/72">
          <Link href="/histoire" className="transition hover:text-ivory">Histoire</Link>
          <Link href="/evenements" className="transition hover:text-ivory">Événements</Link>
          <Link href="/annonces" className="transition hover:text-ivory">Annonces</Link>
          <Link href="/catechese" className="transition hover:text-ivory">Catéchèse</Link>
          <Link href="/communautes" className="transition hover:text-ivory">Communautés</Link>
          <Link href="/contact" className="transition hover:text-ivory">Contact</Link>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gold">Contact</h3>
        <div className="grid gap-2 text-sm text-ivory/72">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-gold/70" />
            Natitingou, Bénin
          </span>
          <a
            href="tel:[INSÉRER MON NUMÉRO]"
            className="flex items-center gap-2 transition hover:text-ivory"
          >
            <Phone className="h-4 w-4 shrink-0 text-gold/70" />
            [INSÉRER MON NUMÉRO]
          </a>
          <a
            href="mailto:[INSÉRER MON EMAIL]"
            className="flex items-center gap-2 transition hover:text-ivory"
          >
            <Mail className="h-4 w-4 shrink-0 text-gold/70" />
            [INSÉRER MON EMAIL]
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition hover:text-ivory"
          >
            <Facebook className="h-4 w-4 shrink-0 text-gold/70" />
            Page officielle
          </a>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/10">
      <div className="container flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
        <p className="text-xs text-ivory/40">
          © {new Date().getFullYear()} Cathédrale Saint Sauveur de Natitingou. Tous droits réservés.
        </p>
        <a
          href="https://www.linkedin.com/in/j%C3%A9r%C3%A9mie-houankan-6621463b7"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 text-xs text-ivory/40 transition hover:text-ivory"
          aria-label="Profil LinkedIn de Jérémie HOUANKAN"
        >
          <span>Développé par</span>
          <span className="font-semibold text-ivory/60 transition group-hover:text-gold">
            Jérémie HOUANKAN
          </span>
          <Linkedin className="h-3.5 w-3.5 text-ivory/40 transition group-hover:text-[#0A66C2]" />
        </a>
      </div>
    </div>
  </footer>
);
