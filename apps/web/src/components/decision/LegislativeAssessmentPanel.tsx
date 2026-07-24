import type { CausativeFactorAnalysisResult } from "@/server/domain/decision/causative-factors";
import type { LegislativeAssessmentResult } from "@/server/domain/decision/legislative-assessment";
import { saveLegislativeAssessment } from "@/app/claims/[claimNumber]/decision/actions";

const STATUS_LABELS = {
  SATISFIED: "Satisfied",
  NOT_SATISFIED: "Not satisfied",
  NOT_APPLICABLE: "Not applicable",
  NOT_ASSESSED: "Not assessed",
} as const;

const STATUS_STYLES = {
  SATISFIED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  NOT_SATISFIED: "border-red-300 bg-red-50 text-red-800",
  NOT_APPLICABLE: "border-blue-300 bg-blue-50 text-blue-800",
  NOT_ASSESSED: "border-slate-300 bg-slate-50 text-slate-700",
} as const;

export function LegislativeAssessmentPanel({
  claimNumber,
  result,
  causativeFactors,
}: {
  claimNumber: string;
  result: LegislativeAssessmentResult;
  causativeFactors: CausativeFactorAnalysisResult;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-700">Legislative assessment</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Apply findings to each statutory element</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{result.explanation}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
            <Summary label="Satisfied" value={result.satisfied} className="bg-emerald-50 text-emerald-800" />
            <Summary label="Not satisfied" value={result.notSatisfied} className="bg-red-50 text-red-800" />
            <Summary label="N/A" value={result.notApplicable} className="bg-blue-50 text-blue-800" />
            <Summary label="Pending" value={result.notAssessed} className="bg-slate-100 text-slate-700" />
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {result.boundaryNotice}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {result.elements.map((element) => (
          <article key={element.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{element.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{element.prompt}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[element.status]}`}>
                {STATUS_LABELS[element.status]}
              </span>
            </div>

            <form action={saveLegislativeAssessment} className="mt-5 space-y-4">
              <input type="hidden" name="claimNumber" value={claimNumber} />
              <input type="hidden" name="elementKey" value={element.key} />

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="text-sm font-semibold text-slate-800">
                  Assessment
                  <select
                    name="status"
                    defaultValue={element.status}
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="NOT_ASSESSED">Not assessed</option>
                    <option value="SATISFIED">Satisfied</option>
                    <option value="NOT_SATISFIED">Not satisfied</option>
                    <option value="NOT_APPLICABLE">Not applicable</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-800">
                  Assessed by
                  <input
                    name="assessedBy"
                    defaultValue={element.assessedBy}
                    placeholder="Name and role"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-800">
                Reasons
                <textarea
                  name="reasons"
                  defaultValue={element.reasons}
                  rows={4}
                  placeholder="Record the human assessment and reasons."
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Evidence summary
                <textarea
                  name="evidenceSummary"
                  defaultValue={element.evidenceSummary}
                  rows={3}
                  placeholder="Summarise the evidence relied upon and any contrary evidence considered."
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-800">Linked causative factors</legend>
                {causativeFactors.factors.length ? (
                  <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {causativeFactors.factors.map((factor) => (
                      <label key={factor.id} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          name="linkedFactorKeys"
                          value={factor.label}
                          defaultChecked={element.linkedFactors.some((linked) => linked.key === factor.id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold text-slate-900">{factor.label}</span>
                          <span className="block text-xs text-slate-500">
                            {factor.substantiation.status.replaceAll("_", " ").toLowerCase()}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No causative factors are available to link.</p>
                )}
              </fieldset>

              {element.assessedAt ? (
                <p className="text-xs text-slate-500">
                  Last assessed {element.assessedAt.toLocaleString("en-AU")} by {element.assessedBy || "an authorised user"}.
                </p>
              ) : null}

              <div className="flex justify-end">
                <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                  Save assessment
                </button>
              </div>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

function Summary({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`min-w-24 rounded-xl px-3 py-2 ${className}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}
