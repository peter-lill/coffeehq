import { ClaimsTable } from "@/components/claims/ClaimsTable";
import { AppShell } from "@/components/layout/AppShell";
import { getClaims } from "@/server/services/claim-service";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const claims = await getClaims();

  return (
    <AppShell activeItem="Claims">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Claims
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Claims workspace
          </h1>

          <p className="mt-2 text-slate-600">
            Review, create and open claims.
          </p>
        </div>

        <ClaimsTable claims={claims} />
      </section>
    </AppShell>
  );
}
