import { describe, expect, it } from "vitest";

import { findClaimNumber } from "@/server/communications/email-claim-matcher";

describe("findClaimNumber", () => {
  it("finds a lowercase claim reference inside a name and parentheses", () => {
    expect(findClaimNumber("amgad shafik ( s25mu365526 )", "")).toEqual({
      claimNumber: "S25MU365526",
      matchMethod: "CLAIM_NUMBER_SUBJECT",
      confidence: 100,
    });
  });

  it("falls back to the email body", () => {
    expect(findClaimNumber("Further information", "Claim S25MU365526 attached")).toEqual({
      claimNumber: "S25MU365526",
      matchMethod: "CLAIM_NUMBER_BODY",
      confidence: 95,
    });
  });

  it("returns null when no valid reference exists", () => {
    expect(findClaimNumber("Amgad Shafik", "No reference supplied")).toBeNull();
  });
});
