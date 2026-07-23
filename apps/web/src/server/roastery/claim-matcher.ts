export type ClaimCandidate = {
  id: string;
  claimNumber: string;
  claimantName: string;
};

export type ClaimMatch = {
  claimId: string | null;
  method: "CLAIM_NUMBER" | "CLAIMANT_NAME" | "NONE";
  confidence: number;
  reasons: string[];
};

function normaliseName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function suggestClaimMatch(input: {
  detectedClaimNumbers: string[];
  searchText: string;
  candidates: ClaimCandidate[];
}): ClaimMatch {
  const detected = new Set(
    input.detectedClaimNumbers.map((number) => number.toUpperCase()),
  );

  const directNumberMatches = input.candidates.filter((claim) =>
    detected.has(claim.claimNumber.toUpperCase()),
  );

  if (directNumberMatches.length === 1) {
    return {
      claimId: directNumberMatches[0].id,
      method: "CLAIM_NUMBER",
      confidence: 1,
      reasons: [`Exact claim reference ${directNumberMatches[0].claimNumber}`],
    };
  }

  const haystack = normaliseName(input.searchText);
  const nameMatches = input.candidates.filter((claim) => {
    const name = normaliseName(claim.claimantName);
    return name.length >= 5 && haystack.includes(name);
  });

  if (nameMatches.length === 1) {
    return {
      claimId: nameMatches[0].id,
      method: "CLAIMANT_NAME",
      confidence: 0.72,
      reasons: [`Claimant name ${nameMatches[0].claimantName} appears in conversation`],
    };
  }

  return {
    claimId: null,
    method: "NONE",
    confidence: 0,
    reasons:
      directNumberMatches.length > 1 || nameMatches.length > 1
        ? ["Multiple possible claims require manual review"]
        : ["No reliable claim match detected"],
  };
}
