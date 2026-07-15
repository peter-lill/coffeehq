import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaimOverview } from "@/components/workspace/ClaimOverview";
import { ClaimTabs } from "@/components/workspace/ClaimTabs";
import { DeterminationReadiness } from "@/components/workspace/DeterminationReadiness";
import { getClaim } from "@/server/services/claim-service";

type ClaimPageProps = {
  params: Promise<{
    claimNumber: string;
  }>;
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { claimNumber } = await params;
  const claim = await getClaim(decodeURIComponent(claimNumber));

  if (!claim) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/claims"
            className="text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            ← Back to claims
          </Link>

          <div className="mt-4">
            <p className="text-sm text-slate-400">Claim workspace</p>
            <h1 className="text-3xl font-bold">{claim.claimNumber}</h1>
            <p className="mt-1 text-slate-300">{claim.name}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <ClaimTabs />

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <ClaimOverview
            claimNumber={claim.claimNumber}
            name={claim.name}
            injury={claim.injury}
            status={claim.status}
            nextAction={claim.nextAction}
          />

          <DeterminationReadiness
            percentage={claim.determinationReadiness}
          />
        </div>
      </div>
    </main>
  );
}
