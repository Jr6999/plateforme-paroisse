"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Sujet requis"),
  message: z.string().min(10, "Message trop court (min. 10 caractères)"),
});

type FormValues = z.infer<typeof schema>;

export const ContactForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const errors = form.formState.errors;

  const submit = form.handleSubmit(async (values) => {
    // TODO : connecter à l'API d'envoi d'email (SMTP via Nodemailer)
    // En attendant, on simule un envoi
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
    form.reset();
  });

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Nom complet <span className="text-destructive">*</span>
          </label>
          <Input placeholder="Votre nom" {...form.register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </label>
          <Input type="email" placeholder="votre@email.com" {...form.register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Sujet <span className="text-destructive">*</span>
        </label>
        <Input placeholder="De quoi s'agit-il ?" {...form.register("subject")} />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          rows={6}
          placeholder="Écrivez votre message ici…"
          {...form.register("message")}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      <Button variant="gold" size="lg" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Envoyer le message
      </Button>
    </form>
  );
};
