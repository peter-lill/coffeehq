import Link from "next/link";
import { notFound } from "next/navigation";

import { BeanClaimAssistant } from "@/components/bean/BeanClaimAssistant";
import { ClaimOverview } from "@/components/workspace/ClaimOverview";
import { ClaimTabs } from "@/components/workspace/ClaimTabs";
import { ClaimTimeline } from "@/components/workspace/ClaimTimeline";
import { DocumentsPanel } from "@/components/workspace/DocumentsPanel";
import { buildBeanClaimBrief } from "@/server/bean/claim-brief";
import { getClaimEvents } from "@/server/services/claim-event-service";
import { getClaimDocuments } from "@/server/services/document-service";
import { getClaim, getClaims } from "@/server/services/claim-service";

export const dynamic = "force-dynamic";

type ClaimPageProps = {
  params: Promise<{
    claimNumber: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  MEDICAL: "Medical",
  EMPLOYMENT: "Employment",
  WORKER: "Worker",
  EMPLOYER: "Employer",
  WITNESS: "Witness",
  PAYROLL: "Payroll",
  COMMUNICATION: "Communication",
  PHOTO: "Photo",
  VIDEO: "Video",
  OTHER: "Other",
};

function readinessTone(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { claimNumber } = await params;
  const claim = await getClaim(decodeURIComponent(claimNumber));

  if (!claim) notFound();

  const [claims, events, documents] = await Promise.all([
    getClaims(),
    getClaimEvents(claim.id),
    getClaimDocuments(claim.id),
  ]);

  const evidenceCounts = documents.reduce<Record<string, number>>(
    (counts, document) => {
      counts[document.category] = (counts[document.category] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const latestEvent = events[0];
  const beanBrief = buildBeanClaimBrief({
    claim,
    documents,
    events,
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/claims"
                className="text-sm font-semibold text-amber-400 hover:text-amber-300"
              >
                ← Claims
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {claim.claimNumber}
                </h1>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-200">
                  {claim.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 sm:text-base">
                {claim.name} · {claim.injury}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Determination readiness
                </p>
                <p className="text-2xl font-bold">
                  {claim.determinationReadiness}%
                </p>
              </div>
              <span
                className={`h-3 w-3 rounded-full ${
                  claim.determinationReadiness >= 80
                    ? "bg-emerald-400"
                    : claim.determinationReadiness >= 50
                      ? "bg-amber-400"
                      : "bg-rose-400"
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <ClaimTabs />

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Next action
            </p>
            <p className="mt-2 font-semibold text-slate-950">
              {claim.nextAction || "No next action recorded"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Evidence
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {documents.length}
            </p>
            <p className="mt-1 text-sm text-slate-600">documents on claim</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Timeline
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {events.length}
            </p>
            <p className="mt-1 text-sm text-slate-600">recorded events</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Readiness
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${readinessTone(
                claim.determinationReadiness,
              )}`}
            >
              {claim.determinationReadiness}% complete
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <ClaimOverview
              claimNumber={claim.claimNumber}
              name={claim.name}
              injury={claim.injury}
              status={claim.status}
              nextAction={claim.nextAction}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-700">
                    Evidence register
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Evidence coverage</h2>
                </div>
                <Link
                  href={`/claims/${encodeURIComponent(claim.claimNumber)}/evidence`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50"
                >
                  Open evidence register
                </Link>
              </div>

              {documents.length === 0 ? (
                <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No evidence has been added to this claim yet.
                </p>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(evidenceCounts)
                    .sort(([left], [right]) => left.localeCompare(right))
                    .map(([category, count]) => (
                      <div
                        key={category}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-600">
                          {categoryLabels[category] ?? category}
                        </p>
                        <p className="mt-1 text-2xl font-bold">{count}</p>
                      </div>
                    ))}
                </div>
              )}
            </section>

            <DocumentsPanel
              claimId={claim.id}
              claimNumber={claim.claimNumber}
              claimantName={claim.name}
              documents={documents}
              claims={claims}
            />

            <ClaimTimeline events={events} />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-32 xl:self-start">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">Work queue</p>
              <h2 className="mt-1 text-xl font-bold">Current priority</h2>
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-950">
                {claim.nextAction || "Review the claim and record the next action."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">Latest activity</p>
              <h2 className="mt-1 text-xl font-bold">Most recent event</h2>
              {latestEvent ? (
                <div className="mt-4">
                  <p className="font-semibold">{latestEvent.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Intl.DateTimeFormat("en-AU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Australia/Brisbane",
                    }).format(new Date(latestEvent.occurredAt))}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  No timeline activity has been recorded.
                </p>
              )}
            </section>

            <BeanClaimAssistant brief={beanBrief} />
          </aside>
        </div>
      </div>
    </main>
  );
}
