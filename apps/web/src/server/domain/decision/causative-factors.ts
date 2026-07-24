import type { ConflictRecord } from "@/server/services/conflict-workspace-service";
import type { MedicalWorkspaceRecord } from "@/server/services/medical-workspace-service";

export type EvidencePosition = "SUPPORTS" | "DISPUTES" | "MIXED" | "NOT_RECORDED";

export type CausativeFactorAnalysis = {
  id: string;
  label: string;
  medical: {
    position: EvidencePosition;
    practitioners: string[];
    opinions: string[];
    clarificationOutstanding: boolean;
  };
  worker: {
    position: EvidencePosition;
    accounts: string[];
  };
  employer: {
    position: EvidencePosition;
    accounts: string[];
  };
  witnesses: {
    position: EvidencePosition;
    evidence: string[];
  };
  objectiveEvidence: {
    position: EvidencePosition;
    evidence: string[];
  };
  outstandingEvidence: string[];
  investigationFinding: string | null;
  decisionRelevance: string | null;
  status: "READY_FOR_FINDING" | "FURTHER_ENQUIRY" | "FINDING_RECORDED";
  explanation: string;
};

export type CausativeFactorAnalysisResult = {
  factors: CausativeFactorAnalysis[];
  count: number;
  findingsRecorded: number;
  requiringFurtherEnquiry: number;
  explanation: string;
  boundaryNotice: string;
};

function normalise(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function key(value: string) {
  return normalise(value).toLocaleLowerCase("en-AU");
}

function unique(values: string[]) {
  return [...new Set(values.map(normalise).filter(Boolean))];
}

function position(values: string[], oppositeValues: string[] = []): EvidencePosition {
  const hasValues = values.some((value) => normalise(value).length > 0);
  const hasOpposite = oppositeValues.some((value) => normalise(value).length > 0);
  if (hasValues && hasOpposite) return "MIXED";
  if (hasValues) return "SUPPORTS";
  if (hasOpposite) return "DISPUTES";
  return "NOT_RECORDED";
}

export function buildCausativeFactorAnalysis(input: {
  medicalRecords: MedicalWorkspaceRecord[];
  conflicts: ConflictRecord[];
}): CausativeFactorAnalysisResult {
  const labels = new Map<string, string>();

  for (const record of input.medicalRecords) {
    if (record.status === "SUPERSEDED" || record.status === "CLOSED") continue;
    for (const factor of record.causativeFactors) {
      if (normalise(factor)) labels.set(key(factor), normalise(factor));
    }
  }

  for (const conflict of input.conflicts) {
    const factor = conflict.causativeFactor || conflict.issue;
    if (normalise(factor)) labels.set(key(factor), normalise(factor));
  }

  const factors = [...labels.entries()].map(([id, label]): CausativeFactorAnalysis => {
    const medical = input.medicalRecords.filter(
      (record) =>
        record.status !== "SUPERSEDED" &&
        record.status !== "CLOSED" &&
        record.causativeFactors.some((factor) => key(factor) === id),
    );
    const conflicts = input.conflicts.filter((conflict) => key(conflict.causativeFactor || conflict.issue) === id);

    const workerAccounts = unique(conflicts.map((conflict) => conflict.workerPosition));
    const employerAccounts = unique(conflicts.map((conflict) => conflict.employerPosition));
    const witnessEvidence = unique(conflicts.map((conflict) => conflict.witnessEvidence));
    const objectiveEvidence = unique(conflicts.map((conflict) => conflict.objectiveEvidence));
    const outstandingEvidence = unique(conflicts.flatMap((conflict) => conflict.outstandingEvidence));
    const findings = unique(conflicts.map((conflict) => conflict.finding || ""));
    const relevance = unique(conflicts.map((conflict) => conflict.decisionRelevance || ""));
    const clarificationOutstanding = medical.some(
      (record) => record.status === "CLARIFICATION_REQUIRED" || record.clarificationQuestions.length > 0,
    );

    const investigationFinding = findings.length === 1 ? findings[0] : findings.length > 1 ? findings.join("; ") : null;
    const status = investigationFinding
      ? "FINDING_RECORDED"
      : clarificationOutstanding || outstandingEvidence.length > 0
        ? "FURTHER_ENQUIRY"
        : "READY_FOR_FINDING";

    return {
      id,
      label,
      medical: {
        position: medical.length ? "SUPPORTS" : "NOT_RECORDED",
        practitioners: unique(medical.map((record) => `${record.practitionerName} (${record.practitionerType})`)),
        opinions: unique(medical.map((record) => record.workContributionOpinion)),
        clarificationOutstanding,
      },
      worker: {
        position: position(workerAccounts, employerAccounts),
        accounts: workerAccounts,
      },
      employer: {
        position: position(employerAccounts, workerAccounts),
        accounts: employerAccounts,
      },
      witnesses: {
        position: witnessEvidence.length ? "MIXED" : "NOT_RECORDED",
        evidence: witnessEvidence,
      },
      objectiveEvidence: {
        position: objectiveEvidence.length ? "MIXED" : "NOT_RECORDED",
        evidence: objectiveEvidence,
      },
      outstandingEvidence,
      investigationFinding,
      decisionRelevance: relevance.length ? relevance.join("; ") : null,
      status,
      explanation:
        status === "FINDING_RECORDED"
          ? "A human investigation finding has been recorded for this causative factor."
          : status === "FURTHER_ENQUIRY"
            ? "Further evidence or medical clarification remains outstanding before a finding is recorded."
            : "Recorded evidence is available for human assessment, but no investigation finding has been recorded.",
    };
  });

  const findingsRecorded = factors.filter((factor) => factor.status === "FINDING_RECORDED").length;
  const requiringFurtherEnquiry = factors.filter((factor) => factor.status === "FURTHER_ENQUIRY").length;

  return {
    factors,
    count: factors.length,
    findingsRecorded,
    requiringFurtherEnquiry,
    explanation: factors.length
      ? `${factors.length} causative factor${factors.length === 1 ? "" : "s"} identified from structured medical and conflict records.`
      : "No structured causative factors have been recorded in the Medical or Conflict workspaces.",
    boundaryNotice:
      "CoffeeHQ groups recorded evidence by causative factor and displays human findings. It does not determine credibility, medical causation, statutory contribution or liability.",
  };
}
