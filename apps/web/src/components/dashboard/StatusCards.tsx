const cards = [
  { label: "Open claims", value: "24" },
  { label: "Awaiting evidence", value: "7" },
  { label: "Decisions due", value: "4" },
  { label: "Ready for determination", value: "3" },
];

export function StatusCards() {
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
