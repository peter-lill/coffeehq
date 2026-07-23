import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/server/auth/current-user";
import { specialistDefinitions } from "@/server/intelligence";
import { workCoverDecisionServices } from "@/server/workcover/boundaries";

export const dynamic = "force-dynamic";

const capabilityLabels: Record<string, string> = {
  extract_evidence: "Extract evidence",
  classify_evidence: "Classify evidence",
  build_chronology: "Build chronology",
  summarise_medical_material: "Summarise medical material",
  identify_issues: "Identify issues",
  map_relationships: "Map relationships",
  draft_summary: "Draft summaries",
  draft_communication: "Draft communications",
};

export default async function IntelligencePage() {
  await requireRole(["ADMIN", "MANAGER"]);

  return (
    <AppShell activeItem="Intelligence Engine">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
            CoffeeOS
          </p>
          <h1 className="mt-2 text-3xl font-bold">Investigation Intelligence Engine</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Specialist services support discrete investigation tasks. Every output must
            identify its sources, remain reviewable and stay separate from liability decisions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {specialistDefinitions.map((specialist) => (
            <article key={specialist.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{specialist.name}</h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Boundary active
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{specialist.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {specialist.capabilities.map((capability) => (
                  <span key={capability} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                    {capabilityLabels[capability] ?? capability}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Cannot determine liability
              </p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-xl font-bold text-sky-950">CoffeeHQ WorkCover boundary</h2>
          <p className="mt-2 text-sm text-sky-900">
            Legislation, qualification, decision readiness and Reasons for Decision remain
            within CoffeeHQ. They may use reviewed intelligence outputs but are not delegated
            to the reusable intelligence specialists.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workCoverDecisionServices.map((service) => (
              <span key={service} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-sky-900 shadow-sm">
                {service.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
