import { AuthForm } from "@/features/auth/auth-form";

export const metadata = {
  title: "Inscription"
};

export default function RegisterPage() {
  return (
    <section className="liturgical-grid container min-h-[calc(100svh-9rem)] py-16">
      <AuthForm mode="register" />
    </section>
  );
}
