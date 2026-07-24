import Link from "next/link";
import { notFound } from "next/navigation";

import { DecisionReadinessPanel } from "@/components/decision/DecisionReadinessPanel";
import { ClaimTabs } from "@/components/workspace/ClaimTabs";
import { buildExecutiveClaimSummary } from "@/server/domain/claim";
import { buildDecisionReadiness } from "@/server/domain/decision/readiness";
import { getClaimEvents } from "@/server/services/claim-event-service";
import { getClaimDocuments } from "@/server/services/document-service";
import { getClaim } from "@/server/services/claim-service";

export const dynamic = "force-dynamic";

type DecisionPageProps = {
  params: Promise<{ claimNumber: string }>;
};

export default async function DecisionPage({ params }: DecisionPageProps) {
  const { claimNumber } = await params;
  const claim = await getClaim(decodeURIComponent(claimNumber));

  if (!claim) notFound();

  const [events, documents] = await Promise.all([
    getClaimEvents(claim.id),
    getClaimDocuments(claim.id),
  ]);

  const summary = buildExecutiveClaimSummary({ claim, documents, events });
  const readiness = buildDecisionReadiness(claim.claimNumber, summary);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
          <Link
            href={`/claims/${encodeURIComponent(claim.claimNumber)}`}
            className="text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            ← Claim workspace
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-400">Decision workspace</p>
              <h1 className="mt-1 text-3xl font-bold">{claim.claimNumber}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {claim.name} · {claim.injury}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Workflow status</p>
              <p className="mt-1 text-xl font-bold">{readiness.status.replaceAll("_", " ")}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <ClaimTabs />
        <DecisionReadinessPanel result={readiness} />
      </div>
    </main>
  );
}
