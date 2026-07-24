import type { ExecutiveClaimSummary } from "@/server/bean/executive-summary";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

function priorityClass(priority: "HIGH" | "MEDIUM" | "LOW") {
  if (priority === "HIGH") return "bg-rose-950/60 text-rose-200";
  if (priority === "MEDIUM") return "bg-amber-950/60 text-amber-200";
  return "bg-slate-900 text-slate-300";
}

export function BeanClaimAssistant({ summary }: { summary: ExecutiveClaimSummary }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-400">Bean</p>
            <h2 className="mt-1 text-xl font-bold">Executive Claim Summary</h2>
          </div>
          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300">
            Grounded
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-200">{summary.overview.summary}</p>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Readiness</p>
              <p className="mt-1 text-4xl font-bold">{summary.readiness.score}%</p>
            </div>
            <p className="max-w-44 text-right text-xs leading-5 text-slate-400">
              {summary.readiness.explanation}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {summary.readiness.categories.map((category) => (
              <div key={category.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">{category.label}</span>
                <span className={category.complete ? "text-emerald-300" : "text-slate-500"}>
                  {category.complete ? "Complete" : "Outstanding"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Evidence gaps</p>
            <p className="mt-1 text-2xl font-bold">{summary.evidenceGaps.length}</p>
          </div>
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Conflicts</p>
            <p className="mt-1 text-2xl font-bold">{summary.conflicts.length}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Recommended next action</h3>
          <div className={`mt-3 rounded-xl p-4 ${priorityClass(summary.nextAction.priority)}`}>
            <p className="font-semibold">{summary.nextAction.title}</p>
            <p className="mt-2 text-sm leading-5 opacity-90">{summary.nextAction.reason}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Evidence gaps</h3>
          {summary.evidenceGaps.length > 0 ? (
            <div className="mt-3 space-y-3">
              {summary.evidenceGaps.slice(0, 4).map((gap) => (
                <article key={gap.id} className="rounded-xl bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{gap.title}</p>
                    <span className="text-xs font-bold text-amber-300">{gap.priority}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-300">{gap.reason}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-emerald-950/50 p-3 text-sm text-emerald-200">
              No configured evidence gaps were identified.
            </p>
          )}
        </div>

        {summary.conflicts.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Accounts to compare</h3>
            <div className="mt-3 space-y-3">
              {summary.conflicts.map((conflict) => (
                <article key={conflict.id} className="rounded-xl bg-slate-900 p-4">
                  <p className="font-semibold">{conflict.issue}</p>
                  <p className="mt-2 text-sm text-slate-300">{conflict.workerPosition}</p>
                  <p className="mt-1 text-sm text-slate-300">{conflict.employerPosition}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Recent chronology</h3>
          {summary.chronology.length > 0 ? (
            <div className="mt-3 space-y-3">
              {summary.chronology.slice(0, 3).map((event) => (
                <article key={event.id} className="rounded-xl bg-slate-900 p-4">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(event.occurredAt)} · {event.sourceLabel}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No chronology is available yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 p-4 text-sm">
          <p className="font-semibold text-slate-200">Procedural fairness</p>
          <p className="mt-1 text-slate-400">{summary.proceduralFairness.explanation}</p>
        </div>

        <p className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
          {summary.boundaryNotice}
        </p>
      </div>
    </section>
  );
}
