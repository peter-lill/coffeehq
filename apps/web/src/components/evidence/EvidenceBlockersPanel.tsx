import {
  evidenceRequestedFromLabels,
  type EvidenceRequirementItem,
} from "@/server/evidence/types";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Australia/Brisbane",
  }).format(date);
}

export function EvidenceBlockersPanel({
  requirements,
}: {
  requirements: EvidenceRequirementItem[];
}) {
  const blockers = requirements.filter(
    (requirement) =>
      requirement.blockingDetermination &&
      (requirement.status === "OUTSTANDING" ||
        requirement.status === "REQUESTED"),
  );

  return (
    <section
      className={`mt-6 rounded-2xl border p-5 shadow-sm ${
        blockers.length
          ? "border-amber-300 bg-amber-50"
          : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={`text-sm font-semibold uppercase tracking-[0.16em] ${
              blockers.length ? "text-amber-800" : "text-emerald-800"
            }`}
          >
            Determination readiness
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {blockers.length
              ? `${blockers.length} evidence blocker${blockers.length === 1 ? "" : "s"}`
              : "No active evidence blockers"}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            blockers.length
              ? "bg-amber-200 text-amber-950"
              : "bg-emerald-200 text-emerald-950"
          }`}
        >
          {blockers.length ? "Evidence incomplete" : "Evidence tracker clear"}
        </span>
      </div>

      {blockers.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {blockers.map((requirement) => (
            <div
              key={requirement.id}
              className="rounded-xl border border-amber-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold text-slate-950">
                  {requirement.title}
                </p>
                {requirement.isOverdue ? (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                    Overdue
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {requirement.requestedFromType
                  ? evidenceRequestedFromLabels[requirement.requestedFromType]
                  : "Source not recorded"}
                {requirement.requestedFrom
                  ? ` · ${requirement.requestedFrom}`
                  : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {requirement.assignedOwner ? (
                  <span>Owner: {requirement.assignedOwner}</span>
                ) : null}
                {requirement.dueDate ? (
                  <span>Due: {formatDate(requirement.dueDate)}</span>
                ) : null}
                {requirement.followUpDate ? (
                  <span>Follow-up: {formatDate(requirement.followUpDate)}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-emerald-900">
          The evidence tracker is not currently identifying any unresolved item as preventing determination. This is a workflow indicator only and is not a liability decision.
        </p>
      )}
    </section>
  );
}
