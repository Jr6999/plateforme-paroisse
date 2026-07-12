import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardClient } from "@/features/analytics/dashboard-client";
import { PageHeading } from "@/components/sections/page-heading";
import { api } from "@/services/api";

export const metadata = {
  title: "Dashboard administrateur"
};

export default async function DashboardPage() {
  const dashboard = await api.dashboard();

  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Dashboard pastoral"
        description="Statistiques globales, analytics, gestion des modules, audit trail et suivi pastoral centralisé."
      />
      <section className="container py-14">
        <DashboardClient data={dashboard} />
      </section>
    </>
  );
}
