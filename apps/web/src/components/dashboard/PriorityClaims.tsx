import Link from "next/link";
import type { ClaimListItem } from "@/server/claims/types";

export function PriorityClaims({ claims }: { claims: ClaimListItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div><h2 className="text-lg font-semibold">Priority claims</h2><p className="text-sm text-slate-500">Claims requiring your attention</p></div>
        <Link href="/claims" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">View all claims</Link>
      </div>
      {claims.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-600">No active claims. Create a claim to begin.</div>
      ) : (
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Claimant</th><th className="px-6 py-3">Injury</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Next action</th></tr></thead><tbody className="divide-y divide-slate-200">{claims.map((claim) => (<tr key={claim.id} className="hover:bg-slate-50"><td className="px-6 py-4"><Link href={`/claims/${encodeURIComponent(claim.claimNumber)}`} className="font-semibold text-slate-950 hover:text-amber-700">{claim.name}</Link><p className="text-sm text-slate-500">{claim.claimNumber}</p></td><td className="px-6 py-4 text-sm">{claim.injury}</td><td className="px-6 py-4"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{claim.status}</span></td><td className="px-6 py-4 text-sm text-slate-600">{claim.nextAction}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}
