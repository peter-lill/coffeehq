export function EvidenceSummaryCards({
  documents,
  communications,
  outstanding,
  requested,
}: {
  documents: number;
  communications: number;
  outstanding: number;
  requested: number;
}) {
  const cards = [
    { label: "Documents", value: documents },
    { label: "Communications", value: communications },
    { label: "Outstanding", value: outstanding },
    { label: "Requested", value: requested },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
