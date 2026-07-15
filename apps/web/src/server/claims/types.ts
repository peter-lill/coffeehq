export type ClaimListItem = {
  id: string;
  name: string;
  claimNumber: string;
  injury: string;
  status: string;
  nextAction: string;
  determinationReadiness: number;
};

export type DashboardSummary = {
  openClaims: number;
  awaitingEvidence: number;
  decisionsDue: number;
  readyForDetermination: number;
};

export type CreateClaimInput = {
  claimNumber: string;
  claimantName: string;
  injury: string;
  status: string;
  nextAction: string;
};
