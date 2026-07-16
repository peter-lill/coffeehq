import Link from "next/link";
import { notFound } from "next/navigation";

import { EvidenceCategorySection } from "@/components/evidence/EvidenceCategorySection";
import { EvidenceRequirementForm } from "@/components/evidence/EvidenceRequirementForm";
import { EvidenceRequirementList } from "@/components/evidence/EvidenceRequirementList";
import { EvidenceSummaryCards } from "@/components/evidence/EvidenceSummaryCards";
import { ClaimTabs } from "@/components/workspace/ClaimTabs";
import { getClaim } from "@/server/services/claim-service";
import { getEvidenceRegister } from "@/server/services/evidence-service";

export const dynamic = "force-dynamic";

type EvidencePageProps = {
  params: Promise<{ claimNumber: string }>;
};

export default async function ClaimEvidencePage({ params }: EvidencePageProps) {
  const { claimNumber } = await params;
  const decodedClaimNumber = decodeURIComponent(claimNumber);
  const claim = await getClaim(decodedClaimNumber);

  if (!claim) notFound();

  const register = await getEvidenceRegister(claim.id);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/claims/${encodeURIComponent(claim.claimNumber)}`}
              className="text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              ← Back to claim overview
            </Link>
            <Link
              href="/evidence"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              All evidence registers
            </Link>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-400">Evidence register</p>
            <h1 className="text-3xl font-bold">{claim.claimNumber}</h1>
            <p className="mt-1 text-slate-300">{claim.name}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <ClaimTabs />

        <EvidenceSummaryCards
          documents={register.totals.documents}
          communications={register.totals.communications}
          outstanding={register.totals.outstanding}
          requested={register.totals.requested}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <EvidenceRequirementList
            claimNumber={claim.claimNumber}
            requirements={register.requirements}
          />
          <EvidenceRequirementForm claimNumber={claim.claimNumber} />
        </div>

        <div className="mt-6 space-y-5">
          {register.groups.map((group) => (
            <EvidenceCategorySection key={group.category} group={group} />
          ))}
        </div>
      </div>
    </main>
  );
}
