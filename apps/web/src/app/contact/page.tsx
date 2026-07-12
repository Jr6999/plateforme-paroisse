import { Mail, MapPin, Phone, Facebook, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/sections/page-heading";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeading
        eyebrow="Contactez-nous"
        title="Bureau paroissial"
        description="Pour toute question, inscription ou demande d'accompagnement. Nous sommes disponibles du lundi au samedi."
      />

      <section className="container py-14 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Envoyer un message</h2>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nom complet</label>
                <Input placeholder="Votre nom" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="votre@email.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sujet</label>
              <Input placeholder="De quoi s'agit-il ?" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={6}
                placeholder="Écrivez votre message ici…"
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="gold" size="lg">
              <Send className="h-4 w-4" /> Envoyer le message
            </Button>
          </form>
        </div>

        {/* Contact info */}
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Adresse</p>
                  <p className="text-sm text-muted-foreground">Bureau paroissial, Avenue Principale<br />Kinshasa, R.D. Congo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+243 000 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground">contact@paroisse.local</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Facebook className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Facebook</p>
                  <p className="text-sm text-muted-foreground">Page officielle de la paroisse</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                <p className="text-sm font-semibold">Horaires du bureau</p>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Lundi – Vendredi</span><span>08h00 – 17h00</span></div>
                <div className="flex justify-between"><span>Samedi</span><span>09h00 – 13h00</span></div>
                <div className="flex justify-between"><span>Dimanche</span><Badge variant="muted">Fermé</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold">Horaires des messes</p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Dimanche</span><span>07h30 · 10h00 · 17h00</span></div>
                <div className="flex justify-between"><span>Lundi – Samedi</span><span>07h00</span></div>
                <div className="flex justify-between"><span>Vendredi</span><span>07h00 · 18h00</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
