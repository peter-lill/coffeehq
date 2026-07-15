import { AppShell } from "@/components/layout/AppShell";
import { PriorityClaims } from "@/components/dashboard/PriorityClaims";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { getDashboardSummary } from "@/server/dashboard/dashboard-service";
import { getClaims } from "@/server/services/claim-service";

export default async function Home() {
  const [summary, claims] = await Promise.all([getDashboardSummary(), getClaims()]);

  return (
    <AppShell activeItem="Dashboard">
      <section className="space-y-6">
        <div><p className="text-sm font-medium text-amber-700">Good evening, Peter</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">Coffee Shop dashboard</h1><p className="mt-2 text-slate-600">Review claim activity, evidence gaps and upcoming decisions.</p></div>
        <StatusCards summary={summary} />
        <PriorityClaims claims={claims.slice(0, 5)} />
      </section>
    </AppShell>
  );
}
