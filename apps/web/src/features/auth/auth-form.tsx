"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

/**
 * Schéma de base — champs communs login + register.
 * Pas de .default() sur les champs pour éviter les incompatibilités
 * entre type input (optionnel) et type output (requis) avec zodResolver.
 */
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  name: z.string().min(2, "Nom requis"),
  phone: z.string().optional(),
});

// Types inférés directement depuis les schémas — aucun type manuel
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4000/api");

// ── Formulaire Connexion ──────────────────────────────────────────────────────

const LoginForm = () => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    if (!API_URL) {
      toast.error("URL de l'API non configurée.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        toast.error(err?.error ?? "Identifiants incorrects ou compte inactif.");
        return;
      }

      const session = await res.json() as {
        user: Parameters<typeof setSession>[0]["user"];
        accessToken: string;
      };
      setSession({ user: session.user, accessToken: session.accessToken });
      toast.success("Session ouverte");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de se connecter à l'API."
      );
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace paroissial sécurisé.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Input
            placeholder="Email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
          <div className="relative">
            <Input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Afficher le mot de passe"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
          <Button
            className="w-full"
            variant="gold"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/auth/inscription" className="underline">
              S&apos;inscrire
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Formulaire Inscription ────────────────────────────────────────────────────

const RegisterForm = () => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "", phone: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    if (!API_URL) {
      toast.error("URL de l'API non configurée.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        toast.error(err?.error ?? "Erreur lors de la création du compte.");
        return;
      }

      const session = await res.json() as {
        user: Parameters<typeof setSession>[0]["user"];
        accessToken: string;
      };
      setSession({ user: session.user, accessToken: session.accessToken });
      toast.success("Compte créé avec succès");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de se connecter à l'API."
      );
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez la plateforme de la Cathédrale Saint Sauveur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Input
            placeholder="Nom complet"
            autoComplete="name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
          <Input
            placeholder="Téléphone (optionnel)"
            type="tel"
            autoComplete="tel"
            {...form.register("phone")}
          />
          <Input
            placeholder="Email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
          <div className="relative">
            <Input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Afficher le mot de passe"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
          <Button
            className="w-full"
            variant="gold"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            <UserPlus className="h-4 w-4" />
            Créer le compte
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link href="/auth/connexion" className="underline">
              Se connecter
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Export public ─────────────────────────────────────────────────────────────

/**
 * Composant wrapper — délègue à LoginForm ou RegisterForm selon le mode.
 * Chaque formulaire a son propre schéma Zod et son propre type inféré,
 * ce qui évite tout conflit de type entre zodResolver et useForm<T>.
 */
export const AuthForm = ({ mode }: { mode: "login" | "register" }) => {
  if (mode === "login") return <LoginForm />;
  return <RegisterForm />;
};
