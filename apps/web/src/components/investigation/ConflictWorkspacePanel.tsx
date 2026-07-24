import type { ConflictRecord } from "@/server/services/conflict-workspace-service";
import { createConflictAction, updateConflictAction } from "@/app/claims/[claimNumber]/investigation/actions";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

export function ConflictWorkspacePanel({
  claimNumber,
  conflicts,
}: {
  claimNumber: string;
  conflicts: ConflictRecord[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-amber-700">Conflict workspace</p>
      <h2 className="mt-1 text-2xl font-bold">Compare and resolve disputed evidence</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
        Record each material conflict against the claim, compare the available accounts and evidence, and document what remains outstanding. A conflict record does not determine credibility or liability.
      </p>

      <form action={createConflictAction.bind(null, claimNumber)} className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Issue in dispute</span>
          <input name="issue" required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Causative factor</span>
          <input name="causativeFactor" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Outstanding evidence</span>
          <textarea name="outstandingEvidence" rows={3} placeholder="One item per line" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Worker position</span>
          <textarea name="workerPosition" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Employer position</span>
          <textarea name="employerPosition" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Witness evidence</span>
          <textarea name="witnessEvidence" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-semibold text-slate-700">Objective evidence</span>
          <textarea name="objectiveEvidence" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="lg:col-span-2">
          <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Add conflict</button>
        </div>
      </form>

      <div className="mt-6 space-y-5">
        {conflicts.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No persisted conflicts have been recorded.</p>
        ) : conflicts.map((conflict) => (
          <article key={conflict.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{conflict.issue}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {conflict.causativeFactor ? `Factor: ${conflict.causativeFactor} · ` : ""}Updated {formatDate(conflict.lastUpdatedAt)}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{conflict.status.replaceAll("_", " ")}</span>
            </div>

            <form action={updateConflictAction.bind(null, claimNumber, conflict.id)} className="mt-5 grid gap-4 lg:grid-cols-2">
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Worker account</span>
                <textarea name="workerPosition" rows={5} defaultValue={conflict.workerPosition} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Employer account</span>
                <textarea name="employerPosition" rows={5} defaultValue={conflict.employerPosition} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Witness evidence</span>
                <textarea name="witnessEvidence" rows={4} defaultValue={conflict.witnessEvidence} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Objective evidence</span>
                <textarea name="objectiveEvidence" rows={4} defaultValue={conflict.objectiveEvidence} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Outstanding evidence</span>
                <textarea name="outstandingEvidence" rows={4} defaultValue={conflict.outstandingEvidence.join("\n")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</span>
                <select name="status" defaultValue={conflict.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="OPEN">Open</option>
                  <option value="EVIDENCE_REQUIRED">Evidence required</option>
                  <option value="PROCEDURAL_FAIRNESS">Procedural fairness</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="NOT_RELEVANT">Not relevant</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Finding</span>
                <textarea name="finding" rows={4} defaultValue={conflict.finding ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Decision relevance</span>
                <textarea name="decisionRelevance" rows={4} defaultValue={conflict.decisionRelevance ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <div className="lg:col-span-2">
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">Save conflict</button>
              </div>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
