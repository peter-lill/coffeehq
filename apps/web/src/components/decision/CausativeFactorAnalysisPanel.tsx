import type {
  CausativeFactorAnalysis,
  CausativeFactorAnalysisResult,
  EvidencePosition,
} from "@/server/domain/decision/causative-factors";

import { saveCausativeFactorAssessment } from "@/app/claims/[claimNumber]/decision/actions";

const LIGHT_STYLES = {
  GREEN: "border-emerald-300 bg-emerald-50 text-emerald-900",
  ORANGE: "border-amber-300 bg-amber-50 text-amber-950",
  RED: "border-red-300 bg-red-50 text-red-900",
  GREY: "border-slate-300 bg-slate-50 text-slate-700",
} as const;

const DOT_STYLES = {
  GREEN: "bg-emerald-500",
  ORANGE: "bg-amber-500",
  RED: "bg-red-500",
  GREY: "bg-slate-400",
} as const;

function title(value: string) {
  return value.replaceAll("_", " ").toLocaleLowerCase("en-AU").replace(/^./, (letter) => letter.toUpperCase());
}

function PositionBadge({ position }: { position: EvidencePosition }) {
  const styles = {
    SUPPORTS: "bg-emerald-100 text-emerald-800",
    DISPUTES: "bg-red-100 text-red-800",
    MIXED: "bg-amber-100 text-amber-900",
    NOT_RECORDED: "bg-slate-100 text-slate-600",
  } as const;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[position]}`}>
      {title(position)}
    </span>
  );
}

function EvidenceSection({
  heading,
  position,
  entries,
}: {
  heading: string;
  position: EvidencePosition;
  entries: string[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-slate-900">{heading}</h4>
        <PositionBadge position={position} />
      </div>
      {entries.length ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {entries.map((entry) => (
            <li key={entry} className="rounded-lg bg-slate-50 px-3 py-2">
              {entry}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No structured evidence recorded.</p>
      )}
    </section>
  );
}

function FactorCard({ claimNumber, factor }: { claimNumber: string; factor: CausativeFactorAnalysis }) {
  const light = factor.substantiation.trafficLight;

  return (
    <article id={`factor-${factor.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`border-b p-5 ${LIGHT_STYLES[light]}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ring-4 ring-white/70 ${DOT_STYLES[light]}`} />
              <h3 className="text-xl font-bold">{factor.label}</h3>
            </div>
            <p className="mt-2 text-sm font-semibold">{title(factor.substantiation.status)}</p>
          </div>
          <span className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-xs font-bold">
            {title(factor.status)}
          </span>
        </div>
        <p className="mt-3 text-sm">{factor.explanation}</p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <EvidenceSection
            heading="Medical evidence"
            position={factor.medical.position}
            entries={[...factor.medical.practitioners, ...factor.medical.opinions]}
          />
          <EvidenceSection heading="Worker position" position={factor.worker.position} entries={factor.worker.accounts} />
          <EvidenceSection heading="Employer position" position={factor.employer.position} entries={factor.employer.accounts} />
          <EvidenceSection heading="Witness evidence" position={factor.witnesses.position} entries={factor.witnesses.evidence} />
          <EvidenceSection
            heading="Objective evidence"
            position={factor.objectiveEvidence.position}
            entries={factor.objectiveEvidence.evidence}
          />
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="font-bold text-slate-900">Outstanding enquiries</h4>
            {factor.outstandingEvidence.length ? (
              <ul className="mt-3 space-y-2 text-sm text-amber-900">
                {factor.outstandingEvidence.map((entry) => (
                  <li key={entry} className="rounded-lg bg-amber-50 px-3 py-2">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-emerald-700">No outstanding enquiries recorded.</p>
            )}
          </section>
        </div>

        {(factor.investigationFinding || factor.decisionRelevance) && (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-bold text-slate-900">Investigation finding</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {factor.investigationFinding || "Not recorded."}
              </p>
            </section>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-bold text-slate-900">Decision relevance</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {factor.decisionRelevance || "Not recorded."}
              </p>
            </section>
          </div>
        )}

        <form action={saveCausativeFactorAssessment} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <input type="hidden" name="claimNumber" value={claimNumber} />
          <input type="hidden" name="factorKey" value={factor.label} />
          <div className="grid gap-4 lg:grid-cols-[240px_1fr_220px_auto] lg:items-end">
            <label className="text-sm font-semibold text-slate-800">
              Human substantiation finding
              <select
                name="status"
                defaultValue={factor.substantiation.status}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="NOT_ASSESSED">Grey — Not assessed</option>
                <option value="SUBSTANTIATED">Green — Substantiated</option>
                <option value="PARTIALLY_SUBSTANTIATED">Orange — Partially substantiated</option>
                <option value="UNSUBSTANTIATED">Red — Unsubstantiated</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Reasons
              <textarea
                name="reasons"
                defaultValue={factor.substantiation.reasons}
                rows={3}
                placeholder="Record the evidence-based reasons for the finding."
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Assessed by
              <input
                name="assessedBy"
                defaultValue={factor.substantiation.assessedBy}
                placeholder="Name or role"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Save finding
            </button>
          </div>
          {factor.substantiation.assessedAt && (
            <p className="mt-3 text-xs text-slate-500">
              Last assessed {factor.substantiation.assessedAt.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}
              {factor.substantiation.assessedBy ? ` by ${factor.substantiation.assessedBy}` : ""}.
            </p>
          )}
        </form>
      </div>
    </article>
  );
}

export function CausativeFactorAnalysisPanel({
  claimNumber,
  result,
}: {
  claimNumber: string;
  result: CausativeFactorAnalysisResult;
}) {
  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-700">Causative factor analysis</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Decision matrix</h2>
            <p className="mt-2 text-sm text-slate-600">{result.explanation}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-emerald-900">
              <p className="text-2xl font-bold">{result.substantiated}</p><p className="text-xs font-bold">Substantiated</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-center text-amber-950">
              <p className="text-2xl font-bold">{result.partiallySubstantiated}</p><p className="text-xs font-bold">Partially</p>
            </div>
            <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-red-900">
              <p className="text-2xl font-bold">{result.unsubstantiated}</p><p className="text-xs font-bold">Unsubstantiated</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-slate-700">
              <p className="text-2xl font-bold">{result.notAssessed}</p><p className="text-xs font-bold">Not assessed</p>
            </div>
          </div>
        </div>

        {result.factors.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Causative factor</th>
                  <th className="px-3 py-3">Finding</th>
                  <th className="px-3 py-3">Medical</th>
                  <th className="px-3 py-3">Worker</th>
                  <th className="px-3 py-3">Employer</th>
                  <th className="px-3 py-3">Investigation</th>
                </tr>
              </thead>
              <tbody>
                {result.factors.map((factor) => (
                  <tr key={factor.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 font-bold text-slate-900">
                      <a href={`#factor-${factor.id}`} className="hover:text-amber-700">{factor.label}</a>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <span className={`h-3 w-3 rounded-full ${DOT_STYLES[factor.substantiation.trafficLight]}`} />
                        {title(factor.substantiation.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3"><PositionBadge position={factor.medical.position} /></td>
                    <td className="px-3 py-3"><PositionBadge position={factor.worker.position} /></td>
                    <td className="px-3 py-3"><PositionBadge position={factor.employer.position} /></td>
                    <td className="px-3 py-3 font-semibold text-slate-700">{title(factor.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Add causative factors in the Medical or Conflict workspace to populate this analysis.
          </div>
        )}

        <p className="mt-4 rounded-lg bg-slate-950 px-4 py-3 text-xs leading-5 text-slate-200">{result.boundaryNotice}</p>
      </div>

      {result.factors.map((factor) => (
        <FactorCard key={factor.id} claimNumber={claimNumber} factor={factor} />
      ))}
    </section>
  );
}
