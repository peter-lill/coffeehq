import type {
  ExecutiveClaimSummaryInput,
  ReadinessCategory,
  ReadinessResult,
} from "./executive-summary.types";

const hasCategory = (input: ExecutiveClaimSummaryInput, category: string) =>
  input.documents.some((document) => document.category === category);

const hasEvent = (input: ExecutiveClaimSummaryInput, type: string) =>
  input.events.some((event) => event.type === type);

export function calculateReadiness(input: ExecutiveClaimSummaryInput): ReadinessResult {
  const definitions = [
    ["medical", "Medical", 20, hasCategory(input, "MEDICAL"), "Medical evidence is recorded."],
    ["worker", "Worker evidence", 20, hasCategory(input, "WORKER"), "A worker account is recorded."],
    ["employer", "Employer evidence", 20, hasCategory(input, "EMPLOYER"), "An employer response is recorded."],
    ["chronology", "Chronology", 10, input.events.length > 0, "At least one chronology event is recorded."],
    ["witness", "Witness evidence", 10, hasCategory(input, "WITNESS"), "Witness evidence is recorded."],
    ["payroll", "Payroll", 10, hasCategory(input, "PAYROLL"), "Payroll or roster evidence is recorded."],
    [
      "fairness",
      "Procedural fairness",
      10,
      hasEvent(input, "NATURAL_JUSTICE_ISSUED") && hasEvent(input, "WORKER_RESPONSE_RECEIVED"),
      "Procedural fairness has been issued and a worker response is recorded.",
    ],
  ] as const;

  const categories: ReadinessCategory[] = definitions.map(
    ([key, label, weight, complete, completeExplanation]) => ({
      key,
      label,
      weight,
      complete,
      score: complete ? weight : 0,
      explanation: complete
        ? completeExplanation
        : `${label} is not yet evidenced as complete in the claim record.`,
    }),
  );

  const score = categories.reduce((total, category) => total + category.score, 0);
  const incomplete = categories.filter((category) => !category.complete).map((category) => category.label);

  return {
    score,
    categories,
    explanation:
      incomplete.length === 0
        ? "All configured readiness checks are complete."
        : `${incomplete.length} readiness area(s) remain incomplete: ${incomplete.join(", ")}.`,
  };
}
