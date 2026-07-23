import { describe, expect, it, vi } from "vitest";
import { InvestigationIntelligenceEngine } from "../orchestrator";
import type { IntelligenceSpecialist } from "../types";

const request = {
  organisationId: "org-1",
  investigationId: "claim-1",
  requestedByUserId: "user-1",
  capability: "build_chronology" as const,
  inputRecordIds: ["record-1"],
};

describe("InvestigationIntelligenceEngine", () => {
  it("routes a capability to its specialist and audits both stages", async () => {
    const specialist: IntelligenceSpecialist = {
      id: "CHRONOLOGY_ANALYST",
      name: "Chronology Analyst",
      description: "test",
      capabilities: ["build_chronology"],
      serviceVersion: "1.0.0",
      mayDetermineLiability: false,
      execute: vi.fn(async () => ({
        requestId: "request-1",
        specialistId: "CHRONOLOGY_ANALYST" as const,
        capability: "build_chronology" as const,
        status: "COMPLETED" as const,
        output: [{ date: "2026-07-18", event: "Evidence received" }],
        citations: [{ recordId: "record-1" }],
        warnings: [],
        generatedAt: new Date("2026-07-18T00:00:00Z"),
        serviceVersion: "1.0.0",
      })),
    };
    const audit = vi.fn(async () => undefined);
    const engine = new InvestigationIntelligenceEngine([specialist], audit);

    const result = await engine.execute(request);

    expect(result.status).toBe("COMPLETED");
    expect(specialist.execute).toHaveBeenCalledWith(request);
    expect(audit).toHaveBeenCalledTimes(2);
  });

  it("requires source records", async () => {
    const engine = new InvestigationIntelligenceEngine();
    await expect(engine.execute({ ...request, inputRecordIds: [] })).rejects.toThrow(
      "at least one source record",
    );
  });

  it("never exposes a liability-determining specialist", async () => {
    const engine = new InvestigationIntelligenceEngine();
    const result = await engine.execute(request);
    expect(result.specialistId).toBe("CHRONOLOGY_ANALYST");
    expect(result.status).toBe("REQUIRES_REVIEW");
  });
});
