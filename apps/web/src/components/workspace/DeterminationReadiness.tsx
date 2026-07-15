type DeterminationReadinessProps = {
  documentCount: number;
  eventCount: number;
};

export function DeterminationReadiness({
  documentCount,
  eventCount,
}: DeterminationReadinessProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-amber-700">Investigation readiness</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">Not yet calculated</p>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        CoffeeOS will calculate readiness only after evidence requirements and procedural steps are recorded. No completion is inferred from placeholder data.
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Documents</dt>
          <dd className="font-semibold text-slate-950">{documentCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Recorded events</dt>
          <dd className="font-semibold text-slate-950">{eventCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Medical evidence</dt>
          <dd className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Unknown</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Employer evidence</dt>
          <dd className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Unknown</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Natural justice</dt>
          <dd className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Not recorded</dd>
        </div>
      </dl>
    </aside>
  );
}
