import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { PriorityClaims } from "@/components/dashboard/PriorityClaims";
import { StatusCards } from "@/components/dashboard/StatusCards";
import type { DashboardSummary } from "@/server/claims/types";
import { getClaims } from "@/server/services/claim-service";

export const dynamic = "force-dynamic";

function buildDashboardSummary(claims: Awaited<ReturnType<typeof getClaims>>): DashboardSummary {
  const isClosed = (status: string) => /closed|finalised|accepted|rejected/i.test(status);
  const awaitingEvidence = (value: string) => /evidence|information|report|clarification/i.test(value);
  const decisionDue = (value: string) => /decision due|determination due|rfd due/i.test(value);

  return {
    openClaims: claims.filter((claim) => !isClosed(claim.status)).length,
    awaitingEvidence: claims.filter(
      (claim) => awaitingEvidence(claim.status) || awaitingEvidence(claim.nextAction),
    ).length,
    decisionsDue: claims.filter(
      (claim) => decisionDue(claim.status) || decisionDue(claim.nextAction),
    ).length,
    readyForDetermination: claims.filter(
      (claim) => !isClosed(claim.status) && claim.determinationReadiness >= 80,
    ).length,
  };
}

export default async function HomePage() {
  const claims = await getClaims();
  const summary = buildDashboardSummary(claims);

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
            Start common claim work, review matters requiring attention and track the live workload.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/bean"
            className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm transition hover:border-amber-400 hover:bg-amber-100"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Primary action</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Create File Note</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Paste a call transcript or rough notes and prepare a CPIS-ready file note.
            </p>
          </Link>

          <Link
            href="/claims/new"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Claim intake</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">New Order</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create and register a new claim.</p>
          </Link>

          <Link
            href="/claims"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Existing claim</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Pick up a tab</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Find and continue work on an existing claim.</p>
          </Link>
        </div>

        <StatusCards summary={summary} />
        <PriorityClaims claims={claims} />
      </section>
    </AppShell>
  );
}
