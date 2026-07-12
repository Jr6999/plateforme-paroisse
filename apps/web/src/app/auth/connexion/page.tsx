import { AuthForm } from "@/features/auth/auth-form";

export const metadata = {
  title: "Connexion"
};

export default function LoginPage() {
  return (
    <section className="liturgical-grid container min-h-[calc(100svh-9rem)] py-16">
      <AuthForm mode="login" />
    </section>
  );
}
