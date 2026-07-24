import Link from "next/link";

import type { ClaimListItem } from "@/server/claims/types";
import type { ReportDefinition } from "@/server/reports/definitions";

export function ReportWizard({
  report,
  claims,
}: {
  report: ReportDefinition;
  claims: ClaimListItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-6">
          <div>
            <label
              htmlFor="claim"
              className="block text-sm font-bold text-slate-800"
            >
              Claim
            </label>

            <select
              id="claim"
              name="claim"
              defaultValue=""
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950"
            >
              <option value="" disabled>
                Select a claim
              </option>

              {claims.map((claim) => (
                <option key={claim.id} value={claim.claimNumber}>
                  {claim.claimNumber} · {claim.name}
                </option>
              ))}
            </select>
          </div>

          {report.id === "reasons-for-decision" ? (
            <fieldset>
              <legend className="text-sm font-bold text-slate-800">
                Proposed outcome
              </legend>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="radio"
                    name="outcome"
                    value="ACCEPTED"
                    className="size-4"
                  />
                  <span className="font-semibold text-slate-800">Accept</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="radio"
                    name="outcome"
                    value="REJECTED"
                    className="size-4"
                  />
                  <span className="font-semibold text-slate-800">Reject</span>
                </label>
              </div>
            </fieldset>
          ) : null}

          <fieldset>
            <legend className="text-sm font-bold text-slate-800">
              Include in report
            </legend>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["timeline", "Claim timeline"],
                ["medical", "Medical evidence"],
                ["worker", "Worker submissions"],
                ["employer", "Employer submissions"],
                ["witness", "Witness evidence"],
                ["proceduralFairness", "Procedural fairness"],
                ["evidenceGaps", "Evidence gaps"],
                ["nextActions", "Next actions"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <input
                    type="checkbox"
                    name="include"
                    value={value}
                    defaultChecked
                    className="size-4 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold text-slate-800">
              Output formats
            </legend>

            <div className="mt-3 flex flex-wrap gap-3">
              {report.outputs.map((output) => (
                <label
                  key={output}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    name="output"
                    value={output}
                    defaultChecked
                    className="size-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {output}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="useBean"
                value="true"
                defaultChecked={report.beanSupported}
                disabled={!report.beanSupported}
                className="mt-1 size-4 rounded"
              />

              <span>
                <span className="block font-bold text-amber-950">
                  Generate with BEAN
                </span>
                <span className="mt-1 block text-sm leading-5 text-amber-900">
                  Analyse the claim evidence and assist with drafting,
                  conflicts, gaps and recommended next steps.
                </span>
              </span>
            </label>
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Prepare report
          </button>
        </form>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Selected report
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-950">
            {report.name}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {report.description}
          </p>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">BEAN support</dt>
              <dd className="font-semibold text-slate-800">
                {report.beanSupported ? "Available" : "Not required"}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Formats</dt>
              <dd className="text-right font-semibold text-slate-800">
                {report.outputs.join(", ")}
              </dd>
            </div>
          </dl>
        </section>

        <Link
          href="/reports"
          className="block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Report Centre
        </Link>
      </aside>
    </div>
  );
}
