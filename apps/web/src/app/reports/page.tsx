import { AppShell } from "@/components/layout/AppShell";
import { ReportCentre } from "@/components/reports/ReportCentre";

export default function ReportsPage() {
  return (
    <AppShell activeItem="Reports">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            CoffeeHQ
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Report Centre
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Select a report, choose the relevant claim and configure the
            evidence and output options.
          </p>
        </div>

        <ReportCentre />
      </section>
    </AppShell>
  );
}
