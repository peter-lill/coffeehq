import type {
  DocumentCategory,
  EvidenceRequestedFromType,
  EvidenceRequirementStatus,
} from "@prisma/client";

import {
  createEvidenceRequirementAction,
  updateEvidenceRequirementStatusAction,
} from "@/app/claims/[claimNumber]/investigation/actions";

type EvidenceRequirementItem = {
  id: string;
  category: DocumentCategory;
  title: string;
  description: string | null;
  requestedFrom: string | null;
  requestedFromType: EvidenceRequestedFromType | null;
  requestedAt: Date | null;
  dueDate: Date | null;
  followUpDate: Date | null;
  blockingDetermination: boolean;
  status: EvidenceRequirementStatus;
  completedAt: Date | null;
  links: Array<{
    id: string;
    document: { id: string; originalName: string } | null;
    communication: { id: string; subject: string } | null;
  }>;
};

const statusOrder: EvidenceRequirementStatus[] = [
  "OUTSTANDING",
  "REQUESTED",
  "RECEIVED",
  "NOT_REQUIRED",
];

const statusLabels: Record<EvidenceRequirementStatus, string> = {
  OUTSTANDING: "Outstanding",
  REQUESTED: "Requested",
  RECEIVED: "Received",
  NOT_REQUIRED: "Not required",
};

function formatDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

export function EvidenceRequirementsPanel({
  claimNumber,
  requirements,
}: {
  claimNumber: string;
  requirements: EvidenceRequirementItem[];
}) {
  const counts = statusOrder.reduce<Record<EvidenceRequirementStatus, number>>(
    (result, status) => {
      result[status] = requirements.filter((item) => item.status === status).length;
      return result;
    },
    { OUTSTANDING: 0, REQUESTED: 0, RECEIVED: 0, NOT_REQUIRED: 0 },
  );

  const createAction = createEvidenceRequirementAction.bind(null, claimNumber);

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-700">Evidence workflow</p>
            <h2 className="mt-1 text-2xl font-bold">Evidence requirements</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Track what is required, who it has been requested from, relevant dates,
              linked records and whether it blocks determination.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statusOrder.map((status) => (
              <div key={status} className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                <p className="text-xs text-slate-500">{statusLabels[status]}</p>
                <p className="mt-1 text-xl font-bold">{counts[status]}</p>
              </div>
            ))}
          </div>
        </div>

        <form action={createAction} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700 xl:col-span-2">
            Requirement title
            <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" placeholder="e.g. Treating GP clarification" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Category
            <select name="category" defaultValue="MEDICAL" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
              {Object.values({ MEDICAL: "MEDICAL", EMPLOYMENT: "EMPLOYMENT", WORKER: "WORKER", EMPLOYER: "EMPLOYER", WITNESS: "WITNESS", PAYROLL: "PAYROLL", COMMUNICATION: "COMMUNICATION", OTHER: "OTHER" }).map((category) => (
                <option key={category} value={category}>{category.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Requested from type
            <select name="requestedFromType" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
              <option value="">Not set</option>
              {(["WORKER", "EMPLOYER", "DOCTOR", "WITNESS", "INTERNAL", "OTHER"] as const).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700 xl:col-span-2">
            Description
            <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" placeholder="Why this evidence is required and what issue it relates to." />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Requested from
            <input name="requestedFrom" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" placeholder="Name or organisation" />
          </label>
          <label className="flex items-center gap-2 self-end rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" name="blockingDetermination" defaultChecked />
            Blocks determination
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Due date
            <input type="date" name="dueDate" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Follow-up date
            <input type="date" name="followUpDate" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" />
          </label>
          <div className="flex items-end xl:col-span-2">
            <button type="submit" className="w-full rounded-lg bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800">Add requirement</button>
          </div>
        </form>
      </div>

      {requirements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No evidence requirements have been recorded yet.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {requirements.map((item) => {
            const updateAction = updateEvidenceRequirementStatusAction.bind(
              null,
              claimNumber,
              item.id,
            );
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.category}</span>
                      {item.blockingDetermination ? (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">Blocking</span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{statusLabels[item.status]}</span>
                </div>

                {item.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-slate-500">Requested from</dt><dd className="font-semibold">{item.requestedFrom || item.requestedFromType || "Not set"}</dd></div>
                  <div><dt className="text-slate-500">Requested</dt><dd className="font-semibold">{formatDate(item.requestedAt)}</dd></div>
                  <div><dt className="text-slate-500">Due</dt><dd className="font-semibold">{formatDate(item.dueDate)}</dd></div>
                  <div><dt className="text-slate-500">Follow-up</dt><dd className="font-semibold">{formatDate(item.followUpDate)}</dd></div>
                </dl>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Linked records</p>
                  <p className="mt-1">{item.links.length} linked document or communication record(s).</p>
                </div>

                <form action={updateAction} className="mt-4 flex gap-2">
                  <select name="status" defaultValue={item.status} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                    {statusOrder.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                  <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50">Update</button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
