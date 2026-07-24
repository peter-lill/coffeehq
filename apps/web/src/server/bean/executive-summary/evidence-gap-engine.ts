import type {
  EvidenceGap,
  ExecutiveClaimSummaryInput,
} from "./executive-summary.types";

const rules = [
  ["MEDICAL", "Medical evidence", "Medical evidence is required to ground the injury and causative factors.", "HIGH"],
  ["WORKER", "Worker statement", "The worker's account is required to identify the alleged causative factors.", "HIGH"],
  ["EMPLOYER", "Employer response", "The employer's response is required before factual disputes can be assessed.", "HIGH"],
  ["WITNESS", "Witness evidence", "Witness evidence may assist where accounts differ or alleged conduct was observed.", "MEDIUM"],
  ["PAYROLL", "Payroll or roster evidence", "Objective records may assist with workload, hours or work-pattern allegations.", "MEDIUM"],
] as const;

export function identifyEvidenceGaps(input: ExecutiveClaimSummaryInput): EvidenceGap[] {
  const gaps: EvidenceGap[] = rules
    .filter(([category]) => !input.documents.some((document) => document.category === category))
    .map(([category, title, reason, priority]) => ({
      id: `missing-${category.toLowerCase()}`,
      title,
      reason,
      priority,
      category,
      source: "Configured evidence coverage check",
    }));

  if (input.events.length === 0) {
    gaps.push({
      id: "missing-chronology",
      title: "Claim chronology",
      reason: "A chronology is required to understand the sequence of reported events and evidence received.",
      priority: "HIGH",
      category: "TIMELINE",
      source: "Claim timeline",
    });
  }

  if (!input.claim.nextAction?.trim()) {
    gaps.push({
      id: "missing-next-action",
      title: "Recorded next action",
      reason: "The claim does not currently have an operational next step recorded.",
      priority: "MEDIUM",
      category: "WORKFLOW",
      source: "Claim record",
    });
  }

  return gaps.sort((left, right) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    return order[left.priority] - order[right.priority] || left.title.localeCompare(right.title);
  });
}
