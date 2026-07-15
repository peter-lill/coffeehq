import Link from "next/link";
import type { ClaimListItem } from "@/server/claims/types";

export function ClaimsTable({ claims }: { claims: ClaimListItem[] }) {
  if (claims.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
        <h2 className="text-xl font-semibold">No claims yet</h2>
        <p className="mt-2 text-slate-600">
          Create the first claim to open a CoffeeHQ workspace.
        </p>
        <Link
          href="/claims/new"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800"
        >
          Create claim
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Claimant</th>
              <th className="px-6 py-3">Claim number</th>
              <th className="px-6 py-3">Injury</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Next action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/claims/${encodeURIComponent(claim.claimNumber)}`}
                    className="font-semibold hover:text-amber-700"
                  >
                    {claim.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {claim.claimNumber}
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
  );
}
