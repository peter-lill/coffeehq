import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { getClaims } from "@/server/services/claim-service";
import { getReportDefinition } from "@/server/reports/definitions";

export default async function ReportWizardPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = getReportDefinition(reportId);

  if (!report || !report.available) {
    notFound();
  }

  const claims = await getClaims();

  return (
    <AppShell activeItem="Reports">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Report Centre
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {report.shortName}
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Select a claim and configure the information to include in the
            report.
          </p>
        </div>

        <ReportWizard report={report} claims={claims} />
      </section>
    </AppShell>
  );
}
