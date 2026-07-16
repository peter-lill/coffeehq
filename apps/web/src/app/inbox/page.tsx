import { InboxTable } from "@/components/communications/InboxTable";
import { getInbox } from "@/server/services/communication-service";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const communications = await getInbox();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Communications
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Incoming claims
          </h1>
          <p className="mt-2 text-slate-600">
            Email received through incoming-claims@coffeehq.coffee. Messages without a reliable claim match remain visible for review.
          </p>
        </header>

        <InboxTable communications={communications} />
      </div>
    </main>
  );
}
