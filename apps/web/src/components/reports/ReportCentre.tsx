import Link from "next/link";

import {
  reportCategoryDescriptions,
  reportCategoryLabels,
  reportDefinitions,
  type ReportCategory,
} from "@/server/reports/definitions";

const categoryOrder: ReportCategory[] = [
  "GOLD_STANDARD",
  "COMMUNICATION",
  "MEDICAL",
  "WORKFLOW",
];

export function ReportCentre() {
  return (
    <div className="space-y-8">
      {categoryOrder.map((category) => {
        const reports = reportDefinitions.filter(
          (report) => report.category === category,
        );

        return (
          <section key={category} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {reportCategoryLabels[category]}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {reportCategoryDescriptions[category]}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                        {report.shortName}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-slate-950">
                        {report.name}
                      </h3>
                    </div>

                    {report.beanSupported ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                        BEAN
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {report.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.outputs.map((output) => (
                      <span
                        key={output}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      >
                        {output}
                      </span>
                    ))}
                  </div>

                  {report.available ? (
                    <Link
                      href={`/reports/${report.id}`}
                      className="mt-5 inline-flex justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Generate report
                    </Link>
                  ) : (
                    <span className="mt-5 inline-flex justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
                      Coming soon
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
