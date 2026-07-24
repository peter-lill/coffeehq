import type { DashboardSummary } from "@/server/claims/types";

export function StatusCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    { label: "Open claims", value: summary.openClaims },
    { label: "Awaiting evidence", value: summary.awaitingEvidence },
    { label: "Decisions due", value: summary.decisionsDue },
    { label: "Ready for determination", value: summary.readyForDetermination },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
