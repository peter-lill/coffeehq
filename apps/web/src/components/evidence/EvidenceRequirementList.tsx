import type { EvidenceRequirementStatus } from "@prisma/client";

import { updateEvidenceRequirementStatusAction } from "@/app/claims/[claimNumber]/evidence/actions";
import {
  evidenceCategoryLabels,
  evidenceStatusLabels,
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

function statusClass(status: EvidenceRequirementStatus) {
  switch (status) {
    case "OUTSTANDING":
      return "bg-rose-100 text-rose-800";
    case "REQUESTED":
      return "bg-amber-100 text-amber-900";
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-800";
    case "NOT_REQUIRED":
      return "bg-slate-100 text-slate-700";
  }
}

function actions(status: EvidenceRequirementStatus) {
  switch (status) {
    case "OUTSTANDING":
      return [
        ["REQUESTED", "Mark requested"],
        ["RECEIVED", "Mark received"],
        ["NOT_REQUIRED", "Not required"],
      ] as const;
    case "REQUESTED":
      return [
        ["RECEIVED", "Mark received"],
        ["OUTSTANDING", "Return outstanding"],
        ["NOT_REQUIRED", "Not required"],
      ] as const;
    case "RECEIVED":
    case "NOT_REQUIRED":
      return [["OUTSTANDING", "Reopen"]] as const;
  }
}

export function EvidenceRequirementList({
  claimNumber,
  requirements,
}: {
  claimNumber: string;
  requirements: EvidenceRequirementItem[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Evidence tracker
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Requirements
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {requirements.length}
        </span>
      </div>

      {requirements.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-600">
          No outstanding evidence requirements have been recorded.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {requirements.map((requirement) => (
            <article
              key={requirement.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                        requirement.status,
                      )}`}
                    >
                      {evidenceStatusLabels[requirement.status]}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {evidenceCategoryLabels[requirement.category]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-950">
                    {requirement.title}
                  </h3>
                  {requirement.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {requirement.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {requirement.requestedFrom ? (
                      <span>From: {requirement.requestedFrom}</span>
                    ) : null}
                    {requirement.dueDate ? (
                      <span>Due: {formatDate(requirement.dueDate)}</span>
                    ) : null}
                    {requirement.updatedByName ? (
                      <span>Updated by: {requirement.updatedByName}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {actions(requirement.status).map(([status, label]) => {
                    const action = updateEvidenceRequirementStatusAction.bind(
                      null,
                      claimNumber,
                      requirement.id,
                    );

                    return (
                      <form key={status} action={action}>
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {label}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
