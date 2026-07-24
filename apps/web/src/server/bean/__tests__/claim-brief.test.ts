import { describe, expect, it } from "vitest";

import { buildBeanClaimBrief } from "@/server/bean/claim-brief";

const claim = {
  claimNumber: "S25AA123456",
  name: "Alex Example",
  injury: "psychological injury",
  status: "Under review",
  nextAction: "Request treating GP clarification",
  determinationReadiness: 42,
};

describe("buildBeanClaimBrief", () => {
  it("builds a grounded summary and evidence coverage", () => {
    const brief = buildBeanClaimBrief({
      claim,
      documents: [
        {
          id: "doc-1",
          category: "MEDICAL",
          originalName: "certificate.pdf",
          createdAt: new Date("2026-07-20T00:00:00Z"),
        },
        {
          id: "doc-2",
          category: "WORKER",
          originalName: "statement.pdf",
          createdAt: new Date("2026-07-21T00:00:00Z"),
        },
      ],
      events: [
        {
          id: "event-1",
          type: "EMAIL_RECEIVED",
          title: "Worker statement received",
          description: "Statement added to the claim.",
          occurredAt: new Date("2026-07-21T02:00:00Z"),
        },
      ],
    });

    expect(brief.summary).toContain("S25AA123456");
    expect(brief.summary).toContain("2 document(s)");
    expect(brief.evidenceCoverage).toEqual([
      { category: "MEDICAL", count: 1 },
      { category: "WORKER", count: 1 },
    ]);
    expect(brief.gaps).toContain("No employer evidence is currently recorded.");
    expect(brief.gaps).toContain(
      "Determination readiness is below 50%; further evidence review is likely required.",
    );
  });

  it("sorts chronology newest first and limits it to five events", () => {
    const events = Array.from({ length: 7 }, (_, index) => ({
      id: `event-${index}`,
      type: "NOTE_ADDED",
      title: `Event ${index}`,
      description: null,
      occurredAt: new Date(`2026-07-${String(index + 1).padStart(2, "0")}T00:00:00Z`),
    }));

    const brief = buildBeanClaimBrief({ claim, documents: [], events });

    expect(brief.recentChronology).toHaveLength(5);
    expect(brief.recentChronology[0]?.title).toBe("Event 6");
    expect(brief.recentChronology[4]?.title).toBe("Event 2");
  });

  it("keeps the statutory boundary visible", () => {
    const brief = buildBeanClaimBrief({ claim, documents: [], events: [] });

    expect(brief.boundaryNotice).toContain("does not determine liability");
    expect(brief.gaps).toContain("No claim chronology events are currently recorded.");
  });
});
