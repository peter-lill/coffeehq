import type {
  EvidenceGap,
  ExecutiveClaimSummaryInput,
  RecommendedAction,
} from "./executive-summary.types";

export function recommendNextAction(
  input: ExecutiveClaimSummaryInput,
  gaps: EvidenceGap[],
): RecommendedAction {
  const fairnessIssued = input.events.some((event) => event.type === "NATURAL_JUSTICE_ISSUED");
  const workerResponse = input.events.some((event) => event.type === "WORKER_RESPONSE_RECEIVED");
  const hasEmployerEvidence = input.documents.some((document) => document.category === "EMPLOYER");

  if (hasEmployerEvidence && !fairnessIssued) {
    return {
      title: "Review whether procedural fairness is required",
      reason: "Employer evidence is recorded, but no procedural fairness issue event is recorded.",
      priority: "HIGH",
    };
  }

  if (fairnessIssued && !workerResponse) {
    return {
      title: "Follow up procedural fairness response",
      reason: "Procedural fairness has been issued and no worker response is currently recorded.",
      priority: "HIGH",
    };
  }

  const highPriorityGap = gaps.find((gap) => gap.priority === "HIGH");
  if (highPriorityGap) {
    return {
      title: `Obtain ${highPriorityGap.title.toLowerCase()}`,
      reason: highPriorityGap.reason,
      priority: "HIGH",
    };
  }

  if (input.claim.nextAction?.trim()) {
    return {
      title: input.claim.nextAction.trim(),
      reason: "This is the operational next action currently recorded on the claim.",
      priority: "MEDIUM",
    };
  }

  return {
    title: "Review the available material and record the next action",
    reason: "No higher-priority evidence or procedural fairness action was identified.",
    priority: "LOW",
  };
}
