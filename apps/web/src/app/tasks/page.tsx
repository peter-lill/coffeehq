import { AppShell } from "@/components/layout/AppShell";
import { WorkQueueView } from "@/components/tasks/WorkQueue";
import { getWorkQueue } from "@/server/services/task-service";

export default async function TasksPage() {
  const queue = await getWorkQueue();

  return (
    <AppShell activeItem="Tasks">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Workflow
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            My work queue
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Prioritise overdue evidence, today&apos;s deadlines, claim actions
            and matters ready for determination.
          </p>
        </div>

        <WorkQueueView queue={queue} />
      </section>
    </AppShell>
  );
}
