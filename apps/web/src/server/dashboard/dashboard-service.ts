import { ClaimStatus } from "@prisma/client";
import type { DashboardSummary } from "@/server/claims/types";
import { getClaimStatusCounts } from "@/server/repositories/claim-repository";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const grouped = await getClaimStatusCounts();
  const counts = new Map(grouped.map((item) => [item.status, item._count._all]));
  const count = (status: ClaimStatus) => counts.get(status) ?? 0;

  return {
    openClaims: grouped.reduce((total, item) => {
      return item.status === ClaimStatus.CLOSED ? total : total + item._count._all;
    }, 0),
    awaitingEvidence: count(ClaimStatus.AWAITING_EVIDENCE),
    decisionsDue: count(ClaimStatus.DECISION_DRAFTING),
    readyForDetermination: count(ClaimStatus.READY_FOR_DETERMINATION),
  };
}
