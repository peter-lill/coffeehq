import {
  PROCEDURAL_FAIRNESS_STATUSES,
  type ProceduralFairnessWorkflow,
} from "@/server/services/procedural-fairness-service";
import {
  createProceduralFairnessAction,
  updateProceduralFairnessAction,
} from "@/app/claims/[claimNumber]/investigation/actions";

type Props = {
  claimNumber: string;
  workflows: ProceduralFairnessWorkflow[];
};

function formatDate(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(value)
    : "—";
}

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

export function ProceduralFairnessPanel({ claimNumber, workflows }: Props) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Claim workflow</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Procedural fairness</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track disputed material, recipients, issue dates, response dates and closure from the claim record.
        </p>
      </div>

      <form action={createProceduralFairnessAction.bind(null, claimNumber)} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Recipient
          <select name="recipientType" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
            <option value="WORKER">Worker</option>
            <option value="EMPLOYER">Employer</option>
            <option value="OTHER">Other party</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Recipient name
          <input name="recipientName" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          Why procedural fairness is required
          <textarea name="summary" required rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          Issues requiring response — one per line
          <textarea name="issues" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Proposed due date
          <input name="dueDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <div className="flex items-end">
          <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Add workflow
          </button>
        </div>
      </form>

      {workflows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          No procedural fairness workflow has been recorded for this claim.
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <article key={workflow.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {workflow.recipientType.toLowerCase()} {workflow.recipientName ? `· ${workflow.recipientName}` : ""}
                  </p>
                  <h3 className="mt-1 font-bold text-slate-950">{workflow.summary}</h3>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-900">
                  {statusLabel(workflow.status)}
                </span>
              </div>

              {workflow.issues.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Issues requiring response</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {workflow.issues.map((issue, index) => <li key={`${workflow.id}-${index}`}>• {issue}</li>)}
                  </ul>
                </div>
              )}

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-slate-500">Issued</dt><dd className="font-semibold">{formatDate(workflow.issuedAt)}</dd></div>
                <div><dt className="text-slate-500">Due</dt><dd className="font-semibold">{formatDate(workflow.extensionDate ?? workflow.dueDate)}</dd></div>
                <div><dt className="text-slate-500">Response</dt><dd className="font-semibold">{formatDate(workflow.responseReceivedAt)}</dd></div>
                <div><dt className="text-slate-500">Last update</dt><dd className="font-semibold">{formatDate(workflow.lastUpdatedAt)}</dd></div>
              </dl>

              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{workflow.explanation}</p>

              <form action={updateProceduralFairnessAction.bind(null, claimNumber, workflow.id)} className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Status
                  <select name="status" defaultValue={workflow.status} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm normal-case text-slate-900">
                    {PROCEDURAL_FAIRNESS_STATUSES.map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase text-slate-500">Issued<input name="issuedAt" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                <label className="text-xs font-bold uppercase text-slate-500">Due<input name="dueDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                <label className="text-xs font-bold uppercase text-slate-500">Extension<input name="extensionDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                <label className="text-xs font-bold uppercase text-slate-500">Response received<input name="responseReceivedAt" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                <div className="md:col-span-5">
                  <button className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">Update workflow</button>
                </div>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
