import { AppShell } from "@/components/layout/AppShell";
import { PriorityClaims } from "@/components/dashboard/PriorityClaims";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { getClaims } from "@/server/services/claim-service";

export default async function HomePage() {
  const claims = await getClaims();

  return (
    <AppShell activeItem="Dashboard">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            CoffeeOS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Command Centre
          </h1>

          <p className="mt-2 text-slate-600">
            Review claims requiring attention and track current workload.
          </p>
        </div>

        <StatusCards />
        <PriorityClaims claims={claims} />
      </section>
    </AppShell>
  );
}
