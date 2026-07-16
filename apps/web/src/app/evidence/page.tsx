import { AppShell } from "@/components/layout/AppShell";
import { EvidenceDashboardTable } from "@/components/evidence/EvidenceDashboardTable";
import { getEvidenceDashboard } from "@/server/services/evidence-service";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const claims = await getEvidenceDashboard();
  const outstanding = claims.reduce(
    (total, claim) => total + claim.outstandingCount,
    0,
  );
  const requested = claims.reduce(
    (total, claim) => total + claim.requestedCount,
    0,
  );

  return (
    <AppShell activeItem="Evidence">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Evidence Engine
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Evidence registers
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Organise claim material by source and category, and track evidence that remains outstanding. CoffeeHQ does not draw conclusions from the material in this register.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Claims</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{claims.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Outstanding requirements</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">{outstanding}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Requested requirements</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">{requested}</p>
          </div>
        </div>

        <EvidenceDashboardTable claims={claims} />
      </section>
    </AppShell>
  );
}
