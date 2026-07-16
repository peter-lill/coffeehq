import { InboxAutoRefresh } from "@/components/communications/InboxAutoRefresh";
import { InboxFilters } from "@/components/communications/InboxFilters";
import { InboxTable } from "@/components/communications/InboxTable";
import type { InboxStatusFilter } from "@/server/communications/types";
import { getClaims } from "@/server/services/claim-service";
import {
  getInbox,
  getInboxCounts,
} from "@/server/services/communication-service";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set<InboxStatusFilter>([
  "ALL",
  "RECEIVED",
  "PROCESSING",
  "FILED",
  "NEEDS_REVIEW",
  "FAILED",
  "QUARANTINED",
]);

function statusFilter(value: string | undefined): InboxStatusFilter {
  if (value && allowedStatuses.has(value as InboxStatusFilter)) {
    return value as InboxStatusFilter;
  }
  return "ALL";
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = statusFilter(params.status);
  const search = params.q?.trim() ?? "";
  const [communications, counts, claims] = await Promise.all([
    getInbox({ status: activeStatus, search }),
    getInboxCounts(),
    getClaims(),
  ]);
  const operatorName = process.env.COFFEEHQ_OPERATOR_NAME?.trim() ?? "";

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <InboxAutoRefresh />
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Communications
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Incoming claims
          </h1>
          <p className="mt-2 text-slate-600">
            Email received through incoming-claims@coffeehq.coffee. The page refreshes automatically while it remains open.
          </p>
        </header>

        <InboxFilters
          activeStatus={activeStatus}
          search={search}
          counts={counts}
        />

        <InboxTable
          communications={communications}
          claims={claims}
          operatorName={operatorName}
        />
      </div>
    </main>
  );
}
