"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caracteres")
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nom requis"),
  phone: z.string().optional()
});

type AuthValues = {
  email: string;
  password: string;
  name?: string;
  phone?: string;
};

const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4000/api");

export const AuthForm = ({ mode }: { mode: "login" | "register" }) => {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AuthValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as Resolver<AuthValues>,
    defaultValues: { email: "", password: "", name: "", phone: "" }
  });

  const submit = form.handleSubmit(async (values) => {
    if (!publicApiUrl) {
      toast.error("URL de l'API non configuree pour cette installation.");
      return;
    }

    const endpoint = `${publicApiUrl}/auth/${mode === "login" ? "login" : "register"}`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        let message = "Identifiants incorrects ou compte inactif.";
        try {
          const err = await response.json();
          if (err?.error) message = err.error;
        } catch { /* ignore */ }
        toast.error(message);
        return;
      }

      const session = await response.json();
      // On ne passe que user + accessToken (refreshToken géré côté serveur via cookie)
      setSession({ user: session.user, accessToken: session.accessToken });
      toast.success("Session ouverte");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossible de se connecter à l'API.";
      toast.error(msg);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Connexion" : "Creation de compte"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Accedez a votre espace paroissial securise."
            : "Rejoignez la plateforme communautaire paroissiale."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "register" && (
            <>
              <Input placeholder="Nom complet" {...form.register("name")} />
              <Input placeholder="Telephone" {...form.register("phone")} />
            </>
          )}
          <Input placeholder="Email" type="email" {...form.register("email")} />
          <div className="relative">
            <Input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setShowPassword((value) => !value)}
              aria-label="Afficher le mot de passe"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <Button className="w-full" variant="gold" type="submit" disabled={form.formState.isSubmitting}>
            {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "login" ? "Se connecter" : "Creer le compte"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Pas encore de compte ? <Link href="/auth/inscription">S'inscrire</Link>
              </>
            ) : (
              <>
                Deja inscrit ? <Link href="/auth/connexion">Se connecter</Link>
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
