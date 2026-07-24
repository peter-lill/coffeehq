import type {
  ChronologyItem,
  ExecutiveSummaryEvent,
} from "./executive-summary.types";

export function buildChronology(events: ExecutiveSummaryEvent[]): ChronologyItem[] {
  return [...events]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    )
    .map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      sourceLabel: `Timeline event · ${event.type.replaceAll("_", " ").toLowerCase()}`,
    }));
}
