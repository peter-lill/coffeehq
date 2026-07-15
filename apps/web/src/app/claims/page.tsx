import Link from "next/link";
import { ClaimsTable } from "@/components/claims/ClaimsTable";
import { AppShell } from "@/components/layout/AppShell";
import { getClaims } from "@/server/services/claim-service";

export default async function ClaimsPage() {
  const claims = await getClaims();

  return (
    <AppShell activeItem="Claims">
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-amber-700">CoffeeHQ</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">Claims</h1><p className="mt-2 text-slate-600">Review and manage active claims.</p></div><Link href="/claims/new" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">+ New claim</Link></div>
        <ClaimsTable claims={claims} />
      </section>
    </AppShell>
  );
}
