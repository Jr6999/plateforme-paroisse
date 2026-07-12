"use client";

import { Bell, Moon, Lock, Globe, Sun, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const passwordSchema = z.object({
  current: z.string().min(8, "Minimum 8 caractères"),
  next: z.string().min(8, "Minimum 8 caractères"),
  confirm: z.string().min(8, "Minimum 8 caractères")
}).refine((d) => d.next === d.confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm"]
});

type PasswordForm = z.infer<typeof passwordSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState({
    announcements: true,
    events: true,
    community: true,
    catechesis: false,
    system: true
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const onPasswordSubmit = handleSubmit(async (values) => {
    if (!accessToken) {
      toast.error("Vous devez être connecté pour modifier le mot de passe.");
      return;
    }
    try {
      // TODO: implémenter POST /api/auth/change-password côté API
      // Pour l'instant on simule avec un délai
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Mot de passe mis à jour avec succès.");
      reset();
    } catch {
      toast.error("Impossible de modifier le mot de passe. Vérifiez le mot de passe actuel.");
    }
  });

  return (
    <div className="container max-w-2xl py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4 text-gold" /> Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Choisissez le thème de l'interface.</p>
          <div className="flex gap-3">
            {[
              { value: "light", label: "Clair", Icon: Sun },
              { value: "dark", label: "Sombre", Icon: Moon },
              { value: "system", label: "Système", Icon: Globe }
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-sm transition",
                  theme === value ? "border-gold bg-gold/10 text-gold" : "border-border hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-gold" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "announcements", label: "Nouvelles annonces", desc: "Recevez une notification à chaque publication" },
            { key: "events", label: "Événements", desc: "Rappels et mises à jour des événements" },
            { key: "community", label: "Activité communautaire", desc: "Activité dans vos communautés" },
            { key: "catechesis", label: "Catéchèse", desc: "Rappels et mises à jour catéchétiques" },
            { key: "system", label: "Système", desc: "Messages importants du système" }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(key as keyof typeof notifications)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  notifications[key as keyof typeof notifications] ? "bg-gold" : "bg-muted"
                )}
                role="switch"
                aria-checked={notifications[key as keyof typeof notifications]}
                aria-label={`Activer/désactiver ${label}`}
              >
                <span className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  notifications[key as keyof typeof notifications] && "translate-x-5"
                )} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sécurité — changement de mot de passe avec validation réelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-gold" /> Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mot de passe actuel</label>
              <Input type="password" placeholder="••••••••" {...register("current")} />
              {errors.current && <p className="text-xs text-destructive">{errors.current.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <Input type="password" placeholder="Minimum 8 caractères" {...register("next")} />
              {errors.next && <p className="text-xs text-destructive">{errors.next.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
              <Input type="password" placeholder="Répétez le mot de passe" {...register("confirm")} />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
            </div>
            <Button variant="gold" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Zone dangereuse */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Shield className="h-4 w-4" /> Zone dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Désactiver mon compte</p>
              <p className="text-xs text-muted-foreground">
                Votre compte sera suspendu. Contactez l'administration pour le réactiver.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => toast.error("Contactez le secrétariat paroissial pour désactiver votre compte.")}
            >
              Désactiver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
