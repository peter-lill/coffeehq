const tabs = [
  "Overview",
  "Events",
  "Evidence",
  "Medical",
  "Tasks",
  "Decision",
];

export function ClaimTabs() {
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            index === 0
              ? "bg-amber-400 text-slate-950"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
