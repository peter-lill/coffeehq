import { describe, expect, it } from "vitest";

import { buildExecutiveClaimSummary } from "@/server/bean/executive-summary";

const claim = {
  claimNumber: "S25AA123456",
  name: "Alex Example",
  employerName: "Example Employer",
  injury: "psychological injury",
  status: "UNDER_REVIEW",
  nextAction: "Request treating GP clarification",
  determinationReadiness: 42,
};

const document = (id: string, category: string) => ({
  id,
  category,
  originalName: `${id}.pdf`,
  createdAt: new Date("2026-07-20T00:00:00Z"),
});

const event = (id: string, type: string, day = 21) => ({
  id,
  type,
  title: `${type} event`,
  description: null,
  occurredAt: new Date(`2026-07-${String(day).padStart(2, "0")}T02:00:00Z`),
});

describe("buildExecutiveClaimSummary", () => {
  it("calculates transparent readiness from recorded evidence", () => {
    const summary = buildExecutiveClaimSummary({
      claim,
      documents: [
        document("medical", "MEDICAL"),
        document("worker", "WORKER"),
        document("employer", "EMPLOYER"),
        document("witness", "WITNESS"),
        document("payroll", "PAYROLL"),
      ],
      events: [
        event("fairness", "NATURAL_JUSTICE_ISSUED"),
        event("response", "WORKER_RESPONSE_RECEIVED", 22),
      ],
    });

    expect(summary.readiness.score).toBe(100);
    expect(summary.readiness.categories.every((category) => category.complete)).toBe(true);
    expect(summary.proceduralFairness.status).toBe("COMPLETE");
    expect(summary.evidenceGaps).toHaveLength(0);
  });

  it("prioritises missing core evidence and recommends the next step", () => {
    const summary = buildExecutiveClaimSummary({ claim, documents: [], events: [] });

    expect(summary.readiness.score).toBe(0);
    expect(summary.evidenceGaps[0]?.priority).toBe("HIGH");
    expect(summary.evidenceGaps.map((gap) => gap.category)).toEqual(
      expect.arrayContaining(["MEDICAL", "WORKER", "EMPLOYER", "TIMELINE"]),
    );
    expect(summary.nextAction.priority).toBe("HIGH");
  });

  it("recommends procedural fairness review when employer evidence is present", () => {
    const summary = buildExecutiveClaimSummary({
      claim,
      documents: [document("worker", "WORKER"), document("employer", "EMPLOYER")],
      events: [event("worker-account", "WORKER_RESPONSE_RECEIVED")],
    });

    expect(summary.nextAction.title).toContain("procedural fairness");
    expect(summary.conflicts).toHaveLength(1);
    expect(summary.conflicts[0]?.sourceIds).toEqual(
      expect.arrayContaining(["worker", "employer", "worker-account"]),
    );
  });

  it("sorts the chronology newest first", () => {
    const summary = buildExecutiveClaimSummary({
      claim,
      documents: [],
      events: [event("older", "GENERAL", 1), event("newer", "GENERAL", 9)],
    });

    expect(summary.chronology.map((item) => item.id)).toEqual(["newer", "older"]);
  });

  it("keeps the statutory boundary visible", () => {
    const summary = buildExecutiveClaimSummary({ claim, documents: [], events: [] });

    expect(summary.boundaryNotice).toContain("does not determine liability");
    expect(summary.boundaryNotice).toContain("does not");
  });
});
