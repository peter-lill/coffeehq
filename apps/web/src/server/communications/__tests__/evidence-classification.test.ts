import { describe, expect, it } from "vitest";

import { normaliseEvidenceClassificationInput } from "@/server/communications/evidence-classification";

describe("normaliseEvidenceClassificationInput", () => {
  it("normalises a complete evidence description", () => {
    expect(
      normaliseEvidenceClassificationInput({
        category: "MEDICAL",
        title: "  GP medical certificate dated 15/07/26  ",
        description: "  Certificate supplied by the treating GP.  ",
        relevance: "  Addresses medical causation.  ",
        reviewedByName: "  Peter Lill  ",
        requirementId: "  requirement-1  ",
        applyCategoryToAttachments: true,
      }),
    ).toEqual({
      category: "MEDICAL",
      title: "GP medical certificate dated 15/07/26",
      description: "Certificate supplied by the treating GP.",
      relevance: "Addresses medical causation.",
      reviewedByName: "Peter Lill",
      requirementId: "requirement-1",
      applyCategoryToAttachments: true,
    });
  });

  it("rejects an invalid category", () => {
    expect(() =>
      normaliseEvidenceClassificationInput({
        category: "UNKNOWN",
        title: "Document",
        description: "A valid description",
        reviewedByName: "Peter Lill",
        applyCategoryToAttachments: false,
      }),
    ).toThrow("Select a valid evidence type.");
  });

  it("requires a useful evidence title", () => {
    expect(() =>
      normaliseEvidenceClassificationInput({
        category: "OTHER",
        title: "x",
        description: "A valid description",
        reviewedByName: "Peter Lill",
        applyCategoryToAttachments: false,
      }),
    ).toThrow("Evidence title must contain at least 3 characters.");
  });

  it("allows optional fields to remain empty", () => {
    const result = normaliseEvidenceClassificationInput({
      category: "EMPLOYER",
      title: "Employer response",
      description: "Response supplied by the employer.",
      relevance: "   ",
      reviewedByName: "Peter Lill",
      requirementId: "",
      applyCategoryToAttachments: false,
    });

    expect(result.relevance).toBeUndefined();
    expect(result.requirementId).toBeUndefined();
  });
});
