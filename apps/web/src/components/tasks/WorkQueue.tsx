import Link from "next/link";

import type { WorkQueue, WorkQueuePriority } from "@/server/tasks/types";

function formatDate(date: Date | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Australia/Brisbane",
  }).format(date);
}

const priorityLabels: Record<WorkQueuePriority, string> = {
  OVERDUE: "Overdue",
  DUE_TODAY: "Due today",
  READY: "Ready",
  UPCOMING: "Upcoming",
  WAITING: "Waiting",
};

const priorityClasses: Record<WorkQueuePriority, string> = {
  OVERDUE: "bg-rose-100 text-rose-800",
  DUE_TODAY: "bg-amber-100 text-amber-800",
  READY: "bg-emerald-100 text-emerald-800",
  UPCOMING: "bg-sky-100 text-sky-800",
  WAITING: "bg-slate-100 text-slate-700",
};

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

export function WorkQueueView({ queue }: { queue: WorkQueue }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Overdue"
          value={queue.summary.overdue}
          detail="Action date has passed"
        />
        <SummaryCard
          label="Due today"
          value={queue.summary.dueToday}
          detail="Requires attention today"
        />
        <SummaryCard
          label="Ready"
          value={queue.summary.ready}
          detail="Ready for determination"
        />
        <SummaryCard
          label="Upcoming"
          value={queue.summary.upcoming}
          detail="Future-dated actions"
        />
        <SummaryCard
          label="Waiting"
          value={queue.summary.waiting}
          detail="No action date recorded"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Active work queue
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {queue.summary.total} active action
              {queue.summary.total === 1 ? "" : "s"} across open claims.
            </p>
          </div>
        </div>

        {queue.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-semibold text-slate-950">
              No active work items
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Outstanding evidence and claim actions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Claim
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Owner
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Open
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {queue.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${priorityClasses[item.priority]}`}
                      >
                        {priorityLabels[item.priority]}
                      </span>

                      {item.blockingDetermination ? (
                        <p className="mt-2 text-xs font-semibold text-amber-700">
                          Determination blocker
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-slate-950">
                        {item.claimNumber}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.claimantName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.claimStatus} · {item.determinationReadiness}%
                        ready
                      </p>
                    </td>

                    <td className="max-w-xl px-5 py-4 align-top">
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>

                      {item.description ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {item.description}
                        </p>
                      ) : null}

                      {item.category ? (
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          {item.category.toLowerCase().replaceAll("_", " ")}
                        </p>
                      ) : null}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 align-top">
                      {item.assignedOwner ?? "Unassigned"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 align-top">
                      <p>{formatDate(item.dueDate)}</p>
                      {item.followUpDate ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Follow-up {formatDate(item.followUpDate)}
                        </p>
                      ) : null}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right align-top">
                      <Link
                        href={item.href}
                        className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                      >
                        Open claim
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
