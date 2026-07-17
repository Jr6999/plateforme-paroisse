import { Mail, MapPin, Phone, Facebook, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/sections/page-heading";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeading
        eyebrow="Contactez-nous"
        title="Bureau paroissial"
        description="Cathédrale Saint Sauveur de Natitingou. Pour toute question, inscription ou demande d'accompagnement."
      />

      <section className="container py-14 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Envoyer un message</h2>
          <ContactForm />
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
                  <p className="text-sm text-muted-foreground">Natitingou, Bénin</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Téléphone</p>
                  <p className="text-sm text-muted-foreground">[INSÉRER MON NUMÉRO]</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground">[INSÉRER MON EMAIL]</p>
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
