import Link from "next/link";

import type { EvidenceDashboardItem } from "@/server/evidence/types";

export function EvidenceDashboardTable({
  claims,
}: {
  claims: EvidenceDashboardItem[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">Claim evidence registers</h2>
        <p className="mt-1 text-sm text-slate-600">
          Open a claim to review its material and outstanding evidence requirements.
        </p>
      </div>

      {claims.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">No claims are available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Claim</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Documents</th>
                <th className="px-5 py-3 text-right">Emails</th>
                <th className="px-5 py-3 text-right">Outstanding</th>
                <th className="px-5 py-3 text-right">Requested</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <tr key={claim.claimId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{claim.claimNumber}</p>
                    <p className="text-slate-600">{claim.claimantName}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{claim.status}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">
                    {claim.documentCount}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">
                    {claim.communicationCount}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={claim.outstandingCount ? "font-bold text-rose-700" : "text-slate-500"}>
                      {claim.outstandingCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={claim.requestedCount ? "font-bold text-amber-700" : "text-slate-500"}>
                      {claim.requestedCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/claims/${encodeURIComponent(claim.claimNumber)}/evidence`}
                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Open register
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
