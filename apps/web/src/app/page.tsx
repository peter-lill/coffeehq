const claims = [
  {
    name: "Kate Thomas",
    claimNumber: "S25TD353017",
    injury: "Psychological injury",
    status: "Under review",
    nextAction: "Assess employer response",
  },
  {
    name: "Jai Hood",
    claimNumber: "S25EG365932",
    injury: "Psychological injury",
    status: "Decision drafting",
    nextAction: "Finalise reasons for decision",
  },
  {
    name: "Gerard",
    claimNumber: "Surgery request",
    injury: "Spinal condition",
    status: "Medical review",
    nextAction: "Review surgery evidence",
  },
];

const statusCards = [
  { label: "Open claims", value: "24" },
  { label: "Awaiting evidence", value: "7" },
  { label: "Decisions due", value: "4" },
  { label: "Ready for determination", value: "3" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400">
              CoffeeHQ
            </p>
            <h1 className="text-xl font-semibold">Claims workspace</h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">Peter Lill</p>
            <p className="text-xs text-slate-400">Claims Representative</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl bg-slate-900 p-4 text-slate-200 shadow-sm">
          <nav className="space-y-2">
            <a
              className="block rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950"
              href="#"
            >
              Dashboard
            </a>
            <a
              className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              href="#"
            >
              Claims
            </a>
            <a
              className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              href="#"
            >
              Tasks
            </a>
            <a
              className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              href="#"
            >
              Evidence
            </a>
            <a
              className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              href="#"
            >
              Reports
            </a>
          </nav>
        </aside>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-amber-700">
              Good evening, Peter
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Coffee Shop dashboard
            </h2>
            <p className="mt-2 text-slate-600">
              Review claim activity, evidence gaps and upcoming decisions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold">Priority claims</h3>
                <p className="text-sm text-slate-500">
                  Claims requiring your attention
                </p>
              </div>

              <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                View all claims
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Claimant</th>
                    <th className="px-6 py-3">Injury</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Next action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {claims.map((claim) => (
                    <tr key={claim.claimNumber} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{claim.name}</p>
                        <p className="text-sm text-slate-500">
                          {claim.claimNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">{claim.injury}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {claim.nextAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}