import type { ClaimEventType } from "@prisma/client";

type ClaimTimelineEvent = {
  id: string;
  type: ClaimEventType;
  title: string;
  description: string | null;
  occurredAt: Date;
  createdBy: {
    id: string;
    name: string;
  } | null;
};

type ClaimTimelineProps = {
  events: ClaimTimelineEvent[];
};

function formatEventType(type: ClaimEventType) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  }).format(date);
}

export function ClaimTimeline({ events }: ClaimTimelineProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Claim timeline
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          A chronological history of claim activity.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium text-slate-700">
            No events recorded
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Claim activity will appear here automatically.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-slate-200">
          {events.map((event) => (
            <li key={event.id} className="px-6 py-5">
              <div className="flex gap-4">
                <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-amber-500" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">
                      {event.title}
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {formatEventType(event.type)}
                    </span>
                  </div>

                  {event.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {event.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{formatDate(event.occurredAt)}</span>

                    {event.createdBy ? (
                      <span>Recorded by {event.createdBy.name}</span>
                    ) : (
                      <span>Recorded by CoffeeOS</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
