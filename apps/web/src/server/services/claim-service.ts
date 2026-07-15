import type { Claim } from "@prisma/client";
import type { ClaimListItem, CreateClaimInput } from "@/server/claims/types";
import {
  createClaim as createClaimRecord,
  findClaimByNumber,
  listClaims,
} from "@/server/repositories/claim-repository";

const statusLabels: Record<Claim["status"], string> = {
  OPEN: "Open",
  AWAITING_EVIDENCE: "Awaiting evidence",
  UNDER_REVIEW: "Under review",
  MEDICAL_REVIEW: "Medical review",
  DECISION_DRAFTING: "Decision drafting",
  READY_FOR_DETERMINATION: "Ready for determination",
  CLOSED: "Closed",
};

function toClaimListItem(claim: Claim): ClaimListItem {
  return {
    id: claim.id,
    name: claim.claimantName,
    claimNumber: claim.claimNumber,
    injury: claim.injury,
    status: statusLabels[claim.status],
    nextAction: claim.nextAction,
    determinationReadiness: claim.determinationReadiness,
  };
}

export async function getClaims(): Promise<ClaimListItem[]> {
  const claims = await listClaims();
  return claims.map(toClaimListItem);
}

export async function getClaim(claimNumber: string): Promise<ClaimListItem | null> {
  const claim = await findClaimByNumber(claimNumber);
  return claim ? toClaimListItem(claim) : null;
}

export async function addClaim(input: CreateClaimInput): Promise<ClaimListItem> {
  const claim = await createClaimRecord(input);
  return toClaimListItem(claim);
}
