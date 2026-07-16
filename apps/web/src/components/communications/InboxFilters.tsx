import Link from "next/link";

import type {
  InboxCounts,
  InboxStatusFilter,
} from "@/server/communications/types";

const filters: Array<{
  value: InboxStatusFilter;
  label: string;
  countKey: keyof InboxCounts;
}> = [
  { value: "ALL", label: "All", countKey: "all" },
  { value: "NEEDS_REVIEW", label: "Needs review", countKey: "needsReview" },
  { value: "FILED", label: "Filed", countKey: "filed" },
  { value: "FAILED", label: "Failed", countKey: "failed" },
  { value: "QUARANTINED", label: "Quarantined", countKey: "quarantined" },
];

function filterHref(status: InboxStatusFilter, search: string) {
  const params = new URLSearchParams();
  if (status !== "ALL") params.set("status", status);
  if (search) params.set("q", search);
  const query = params.toString();
  return query ? `/inbox?${query}` : "/inbox";
}

export function InboxFilters({
  activeStatus,
  search,
  counts,
}: {
  activeStatus: InboxStatusFilter;
  search: string;
  counts: InboxCounts;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = activeStatus === filter.value;
          return (
            <Link
              key={filter.value}
              href={filterHref(filter.value, search)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter.label} ({counts[filter.countKey]})
            </Link>
          );
        })}
      </div>

      <form method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
        {activeStatus !== "ALL" ? (
          <input type="hidden" name="status" value={activeStatus} />
        ) : null}
        <label className="sr-only" htmlFor="inbox-search">
          Search incoming emails
        </label>
        <input
          id="inbox-search"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search claim number, claimant, sender or subject"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
        >
          Search
        </button>
        {search ? (
          <Link
            href={filterHref(activeStatus, "")}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </Link>
        ) : null}
      </form>
    </section>
  );
}
