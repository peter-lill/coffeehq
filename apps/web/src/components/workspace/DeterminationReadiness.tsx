type DeterminationReadinessProps = {
  percentage: number;
};

export function DeterminationReadiness({
  percentage,
}: DeterminationReadinessProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-amber-700">
        Determination readiness
      </p>
      <p className="mt-2 text-4xl font-bold">{safePercentage}%</p>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${safePercentage}%` }}
        />
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Medical causation is available. Employer evidence and natural justice
        remain outstanding.
      </p>

      <div className="mt-5 space-y-3 text-sm">
        <ReadinessItem label="Application details" complete />
        <ReadinessItem label="Medical evidence" complete />
        <ReadinessItem label="Employer evidence" />
        <ReadinessItem label="Natural justice response" />
      </div>
    </aside>
  );
}

function ReadinessItem({
  label,
  complete = false,
}: {
  label: string;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {complete ? "Complete" : "Outstanding"}
      </span>
    </div>
  );
}
