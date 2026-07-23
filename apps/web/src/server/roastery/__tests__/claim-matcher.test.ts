import { describe, expect, it } from "vitest";

import { suggestClaimMatch } from "@/server/roastery/claim-matcher";

const claims = [
  { id: "one", claimNumber: "S25AB123456", claimantName: "Alex Example" },
  { id: "two", claimNumber: "S25CD654321", claimantName: "Jordan Sample" },
];

describe("suggestClaimMatch", () => {
  it("prefers an exact claim reference", () => {
    expect(suggestClaimMatch({ detectedClaimNumbers: ["S25AB123456"], searchText: "Jordan Sample", candidates: claims })).toMatchObject({ claimId: "one", method: "CLAIM_NUMBER", confidence: 1 });
  });

  it("suggests a unique claimant name", () => {
    expect(suggestClaimMatch({ detectedClaimNumbers: [], searchText: "Discussion about Jordan Sample and medical evidence", candidates: claims })).toMatchObject({ claimId: "two", method: "CLAIMANT_NAME" });
  });

  it("does not guess where no reliable match exists", () => {
    expect(suggestClaimMatch({ detectedClaimNumbers: [], searchText: "General project discussion", candidates: claims })).toMatchObject({ claimId: null, method: "NONE" });
  });
});
