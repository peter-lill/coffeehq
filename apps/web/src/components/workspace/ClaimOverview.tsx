type ClaimOverviewProps = {
  claimNumber: string;
  name: string;
  injury: string;
  status: string;
  nextAction: string;
};

export function ClaimOverview({
  claimNumber,
  name,
  injury,
  status,
  nextAction,
}: ClaimOverviewProps) {
  const fields = [
    { label: "Claimant", value: name },
    { label: "Claim number", value: claimNumber },
    { label: "Status", value: status },
    { label: "Injury", value: injury },
    { label: "Next action", value: nextAction },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-amber-700">Claim overview</p>
      <h2 className="mt-1 text-2xl font-bold">Claim summary</h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {field.label}
            </p>
            <p className="mt-1 font-semibold">{field.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
