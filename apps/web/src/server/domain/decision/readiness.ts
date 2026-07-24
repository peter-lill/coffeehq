import type { ExecutiveClaimSummary } from "@/server/domain/claim";

export type DecisionReadinessStatus = "PASS" | "WARNING" | "FAIL";

export type DecisionReadinessCheck = {
  key: string;
  label: string;
  status: DecisionReadinessStatus;
  explanation: string;
  href: string;
  blocking: boolean;
};

export type DecisionReadinessResult = {
  score: number;
  status: "READY" | "REVIEW_REQUIRED" | "NOT_READY";
  explanation: string;
  checks: DecisionReadinessCheck[];
  blockingIssues: DecisionReadinessCheck[];
  warnings: DecisionReadinessCheck[];
  boundaryNotice: string;
};

export function buildDecisionReadiness(
  claimNumber: string,
  summary: ExecutiveClaimSummary,
): DecisionReadinessResult {
  const claimBase = `/claims/${encodeURIComponent(claimNumber)}`;

  const checks: DecisionReadinessCheck[] = summary.readiness.categories.map((category) => ({
    key: category.key,
    label: category.label,
    status: category.complete ? "PASS" : category.weight >= 20 ? "FAIL" : "WARNING",
    explanation: category.explanation,
    href: category.key.toLowerCase().includes("medical")
      ? `${claimBase}/investigation#medical-workspace`
      : category.key.toLowerCase().includes("evidence")
        ? `${claimBase}/evidence`
        : category.key.toLowerCase().includes("fair")
          ? `${claimBase}/investigation#procedural-fairness`
          : `${claimBase}/investigation`,
    blocking: !category.complete && category.weight >= 20,
  }));

  if (summary.evidenceGaps.length > 0) {
    checks.push({
      key: "evidence-gaps",
      label: "Outstanding evidence",
      status: summary.evidenceGaps.some((gap) => gap.priority === "HIGH") ? "FAIL" : "WARNING",
      explanation: `${summary.evidenceGaps.length} evidence gap${summary.evidenceGaps.length === 1 ? "" : "s"} require review.`,
      href: `${claimBase}/investigation`,
      blocking: summary.evidenceGaps.some((gap) => gap.priority === "HIGH"),
    });
  }

  if (summary.conflicts.length > 0) {
    checks.push({
      key: "account-conflicts",
      label: "Conflicting accounts",
      status: "WARNING",
      explanation: `${summary.conflicts.length} conflict${summary.conflicts.length === 1 ? "" : "s"} remain recorded for human assessment.`,
      href: `${claimBase}/investigation`,
      blocking: false,
    });
  }

  const blockingIssues = checks.filter((check) => check.blocking);
  const warnings = checks.filter((check) => check.status === "WARNING");

  const status = blockingIssues.length > 0
    ? "NOT_READY"
    : warnings.length > 0
      ? "REVIEW_REQUIRED"
      : "READY";

  const explanation = status === "READY"
    ? "No configured blocking issues were identified. The authorised decision-maker must still review the evidence and make the statutory decision."
    : status === "REVIEW_REQUIRED"
      ? "No configured blocking issue was identified, but warnings require human review before determination."
      : `${blockingIssues.length} blocking issue${blockingIssues.length === 1 ? "" : "s"} must be addressed before determination.`;

  return {
    score: summary.readiness.score,
    status,
    explanation,
    checks,
    blockingIssues,
    warnings,
    boundaryNotice:
      "CoffeeHQ assesses workflow readiness only. It does not accept or reject a claim, determine credibility, or replace the authorised decision-maker.",
  };
}
