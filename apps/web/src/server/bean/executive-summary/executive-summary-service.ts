import { buildChronology } from "./chronology-engine";
import { identifyConflicts } from "./conflict-engine";
import { identifyEvidenceGaps } from "./evidence-gap-engine";
import type {
  EvidenceCoverageItem,
  ExecutiveClaimSummary,
  ExecutiveClaimSummaryInput,
} from "./executive-summary.types";
import { recommendNextAction } from "./next-action-engine";
import { calculateReadiness } from "./readiness-engine";

const categoryLabels: Record<string, string> = {
  MEDICAL: "Medical",
  EMPLOYMENT: "Employment",
  WORKER: "Worker",
  EMPLOYER: "Employer",
  WITNESS: "Witness",
  PAYROLL: "Payroll",
  COMMUNICATION: "Communication",
  PHOTO: "Photo",
  VIDEO: "Video",
  OTHER: "Other",
};

export function buildExecutiveClaimSummary(
  input: ExecutiveClaimSummaryInput,
): ExecutiveClaimSummary {
  const evidenceCounts = input.documents.reduce<Record<string, number>>((counts, document) => {
    counts[document.category] = (counts[document.category] ?? 0) + 1;
    return counts;
  }, {});

  const evidenceCoverage: EvidenceCoverageItem[] = Object.entries(evidenceCounts)
    .map(([category, count]) => ({
      category,
      label: categoryLabels[category] ?? category,
      count,
      complete: count > 0,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const readiness = calculateReadiness(input);
  const evidenceGaps = identifyEvidenceGaps(input);
  const conflicts = identifyConflicts(input);
  const chronology = buildChronology(input.events);
  const fairnessIssued = input.events.some((event) => event.type === "NATURAL_JUSTICE_ISSUED");
  const responseReceived = input.events.some((event) => event.type === "WORKER_RESPONSE_RECEIVED");
  const fairnessStatus = responseReceived
    ? "COMPLETE"
    : fairnessIssued
      ? "AWAITING_RESPONSE"
      : "NOT_STARTED";

  return {
    overview: {
      claimNumber: input.claim.claimNumber,
      worker: input.claim.name,
      employer: input.claim.employerName ?? null,
      injury: input.claim.injury,
      status: input.claim.status,
      summary: `${input.claim.claimNumber} concerns ${input.claim.name}'s ${input.claim.injury}. The record currently contains ${input.documents.length} document(s) and ${input.events.length} timeline event(s).`,
    },
    readiness,
    evidenceCoverage,
    evidenceGaps,
    conflicts,
    chronology,
    proceduralFairness: {
      issued: fairnessIssued,
      responseReceived,
      status: fairnessStatus,
      explanation:
        fairnessStatus === "COMPLETE"
          ? "Procedural fairness issue and worker response events are recorded."
          : fairnessStatus === "AWAITING_RESPONSE"
            ? "Procedural fairness has been issued and a worker response is not yet recorded."
            : "No procedural fairness issue event is currently recorded.",
    },
    nextAction: recommendNextAction(input, evidenceGaps),
    sourceCounts: {
      documents: input.documents.length,
      events: input.events.length,
    },
    boundaryNotice:
      "Bean organises recorded claim information only. It does not determine liability, replace medical opinion or make a statutory decision.",
    generatedAt: new Date(),
  };
}
