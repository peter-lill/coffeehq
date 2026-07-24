import type { ExecutiveClaimSummary } from "@/server/domain/claim";

function priorityClass(priority: "HIGH" | "MEDIUM" | "LOW") {
  if (priority === "HIGH") return "bg-rose-100 text-rose-800";
  if (priority === "MEDIUM") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function readinessClass(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 50) return "text-amber-700";
  return "text-rose-700";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

export function InvestigationDashboard({ summary }: { summary: ExecutiveClaimSummary }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Decision readiness</p>
          <p className={`mt-2 text-5xl font-bold ${readinessClass(summary.readiness.score)}`}>
            {summary.readiness.score}%
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{summary.readiness.explanation}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Evidence gaps</p>
          <p className="mt-2 text-5xl font-bold text-slate-950">{summary.evidenceGaps.length}</p>
          <p className="mt-3 text-sm text-slate-600">Prioritised items requiring review or collection.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Account conflicts</p>
          <p className="mt-2 text-5xl font-bold text-slate-950">{summary.conflicts.length}</p>
          <p className="mt-3 text-sm text-slate-600">Differences to investigate without deciding credibility.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-700">Recommended next action</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{summary.nextAction.title}</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(summary.nextAction.priority)}`}>
            {summary.nextAction.priority}
          </span>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">{summary.nextAction.reason}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Explainable readiness</p>
          <h2 className="mt-1 text-2xl font-bold">Readiness breakdown</h2>
          <div className="mt-6 space-y-4">
            {summary.readiness.categories.map((category) => (
              <div key={category.key}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-slate-800">{category.label}</span>
                  <span className={category.complete ? "font-bold text-emerald-700" : "font-semibold text-slate-500"}>
                    {category.score}/{category.weight}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={category.complete ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-slate-300"}
                    style={{ width: `${category.complete ? 100 : 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{category.explanation}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Procedural fairness</p>
          <h2 className="mt-1 text-2xl font-bold">{summary.proceduralFairness.status.replaceAll("_", " ")}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{summary.proceduralFairness.explanation}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-slate-500">Issued</dt>
              <dd className="mt-1 font-bold text-slate-900">{summary.proceduralFairness.issued ? "Yes" : "No"}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-slate-500">Response received</dt>
              <dd className="mt-1 font-bold text-slate-900">{summary.proceduralFairness.responseReceived ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-700">Outstanding evidence</p>
        <h2 className="mt-1 text-2xl font-bold">Prioritised evidence gaps</h2>
        {summary.evidenceGaps.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {summary.evidenceGaps.map((gap) => (
              <article key={gap.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{gap.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{gap.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(gap.priority)}`}>
                    {gap.priority}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{gap.reason}</p>
                <p className="mt-3 text-xs text-slate-500">Source: {gap.source}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            No configured evidence gaps were identified.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-700">Conflict register</p>
        <h2 className="mt-1 text-2xl font-bold">Accounts requiring comparison</h2>
        {summary.conflicts.length > 0 ? (
          <div className="mt-6 space-y-4">
            {summary.conflicts.map((conflict) => (
              <article key={conflict.id} className="rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">{conflict.issue}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Worker account</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{conflict.workerPosition}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Employer account</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{conflict.employerPosition}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggested evidence</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {conflict.recommendedEvidence.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            No worker and employer account comparison is currently available.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-700">Investigation chronology</p>
        <h2 className="mt-1 text-2xl font-bold">Recent claim sequence</h2>
        {summary.chronology.length > 0 ? (
          <div className="mt-6 space-y-4">
            {summary.chronology.slice(0, 10).map((item) => (
              <article key={item.id} className="grid gap-2 border-l-2 border-amber-300 pl-4 md:grid-cols-[120px_1fr]">
                <p className="text-sm font-semibold text-slate-500">{formatDate(item.occurredAt)}</p>
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">{item.sourceLabel}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No chronology is available yet.</p>
        )}
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
        {summary.boundaryNotice}
      </p>
    </div>
  );
}
