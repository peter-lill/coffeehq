const CLAIM_NUMBER_PATTERN = /\b[A-Z]\d{2}[A-Z]{2}\d{6}\b/i;

export function findClaimNumber(subject: string, bodyText: string) {
  const subjectMatch = subject.match(CLAIM_NUMBER_PATTERN)?.[0];
  if (subjectMatch) {
    return {
      claimNumber: subjectMatch.toUpperCase(),
      matchMethod: "CLAIM_NUMBER_SUBJECT" as const,
      confidence: 100,
    };
  }

  const bodyMatch = bodyText.match(CLAIM_NUMBER_PATTERN)?.[0];
  if (bodyMatch) {
    return {
      claimNumber: bodyMatch.toUpperCase(),
      matchMethod: "CLAIM_NUMBER_BODY" as const,
      confidence: 95,
    };
  }

  return null;
}
