import Link from "next/link";

import type {
  DecisionReadinessCheck,
  DecisionReadinessResult,
} from "@/server/domain/decision/readiness";

function statusClasses(status: DecisionReadinessCheck["status"]) {
  if (status === "PASS") return "bg-emerald-100 text-emerald-800";
  if (status === "WARNING") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function readinessClasses(status: DecisionReadinessResult["status"]) {
  if (status === "READY") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "REVIEW_REQUIRED") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-rose-200 bg-rose-50 text-rose-900";
}

export function DecisionReadinessPanel({ result }: { result: DecisionReadinessResult }) {
  return (
    <div className="space-y-6">
      <section className={`rounded-2xl border p-6 shadow-sm ${readinessClasses(result.status)}`}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Decision readiness</p>
            <h2 className="mt-2 text-3xl font-bold">{result.status.replaceAll("_", " ")}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6">{result.explanation}</p>
          </div>
          <div className="rounded-2xl bg-white/70 px-5 py-4 text-right shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">Calculated score</p>
            <p className="mt-1 text-5xl font-bold">{result.score}%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Checks</p>
          <p className="mt-2 text-4xl font-bold text-slate-950">{result.checks.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocking issues</p>
          <p className="mt-2 text-4xl font-bold text-rose-700">{result.blockingIssues.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Warnings</p>
          <p className="mt-2 text-4xl font-bold text-amber-700">{result.warnings.length}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-700">Deterministic assessment</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Readiness checks</h2>
        <div className="mt-6 space-y-4">
          {result.checks.map((check) => (
            <article key={check.key} className="rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-950">{check.label}</h3>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{check.explanation}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(check.status)}`}>
                  {check.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-slate-500">
                  {check.blocking ? "Blocks determination" : "Human review item"}
                </p>
                <Link href={check.href} className="text-sm font-bold text-amber-700 hover:text-amber-800">
                  Open workspace →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
        {result.boundaryNotice}
      </p>
    </div>
  );
}
