import type { BeanClaimBrief } from "@/server/bean/claim-brief";

const categoryLabels: Record<string, string> = {
  MEDICAL: "Medical",
  EMPLOYMENT: "Employment",
  WORKER: "Worker",
  EMPLOYER: "Employer",
  WITNESS: "Witness",
  PAYROLL: "Payroll",
  COMMUNICATION: "Communication",
  PHOTO: "Photo",
  VIDEO: "Video",
  OTHER: "Other",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

export function BeanClaimAssistant({ brief }: { brief: BeanClaimBrief }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-400">Bean</p>
            <h2 className="mt-1 text-xl font-bold">Claim assistant</h2>
          </div>
          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300">
            Grounded
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-200">{brief.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span className="rounded-lg bg-slate-900 px-3 py-2">
            {brief.sourceCounts.documents} document(s)
          </span>
          <span className="rounded-lg bg-slate-900 px-3 py-2">
            {brief.sourceCounts.events} timeline event(s)
          </span>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Evidence coverage
          </h3>
          {brief.evidenceCoverage.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {brief.evidenceCoverage.map((item) => (
                <div key={item.category} className="rounded-xl bg-slate-900 p-3">
                  <p className="text-xs text-slate-400">
                    {categoryLabels[item.category] ?? item.category}
                  </p>
                  <p className="mt-1 text-lg font-bold">{item.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No evidence is currently recorded.</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Recent chronology
          </h3>
          {brief.recentChronology.length > 0 ? (
            <div className="mt-3 space-y-3">
              {brief.recentChronology.map((event) => (
                <article key={event.id} className="rounded-xl bg-slate-900 p-4">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(event.occurredAt)} · {event.sourceLabel}
                  </p>
                  {event.description ? (
                    <p className="mt-2 text-sm leading-5 text-slate-300">
                      {event.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No chronology is available yet.</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Review gaps
          </h3>
          {brief.gaps.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-amber-100">
              {brief.gaps.map((gap) => (
                <li key={gap} className="rounded-xl bg-amber-950/50 p-3">
                  {gap}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-emerald-950/50 p-3 text-sm text-emerald-200">
              No obvious record gaps were identified by the current checks.
            </p>
          )}
        </div>

        <p className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
          {brief.boundaryNotice}
        </p>
      </div>
    </section>
  );
}
