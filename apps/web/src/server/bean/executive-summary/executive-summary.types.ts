export type ExecutiveSummaryClaim = {
  claimNumber: string;
  name: string;
  employerName?: string | null;
  injury: string;
  status: string;
  nextAction: string | null;
  determinationReadiness: number;
};

export type ExecutiveSummaryDocument = {
  id: string;
  category: string;
  originalName: string;
  createdAt: Date;
};

export type ExecutiveSummaryEvent = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  occurredAt: Date;
};

export type ExecutiveClaimSummaryInput = {
  claim: ExecutiveSummaryClaim;
  documents: ExecutiveSummaryDocument[];
  events: ExecutiveSummaryEvent[];
};

export type ReadinessCategory = {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
  score: number;
  explanation: string;
};

export type ReadinessResult = {
  score: number;
  categories: ReadinessCategory[];
  explanation: string;
};

export type EvidenceCoverageItem = {
  category: string;
  label: string;
  count: number;
  complete: boolean;
};

export type EvidenceGap = {
  id: string;
  title: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  source: string;
};

export type ClaimConflict = {
  id: string;
  issue: string;
  workerPosition: string;
  employerPosition: string;
  recommendedEvidence: string[];
  sourceIds: string[];
};

export type ChronologyItem = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date;
  sourceLabel: string;
};

export type RecommendedAction = {
  title: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export type ExecutiveClaimSummary = {
  overview: {
    claimNumber: string;
    worker: string;
    employer: string | null;
    injury: string;
    status: string;
    summary: string;
  };
  readiness: ReadinessResult;
  evidenceCoverage: EvidenceCoverageItem[];
  evidenceGaps: EvidenceGap[];
  conflicts: ClaimConflict[];
  chronology: ChronologyItem[];
  proceduralFairness: {
    issued: boolean;
    responseReceived: boolean;
    status: "NOT_STARTED" | "AWAITING_RESPONSE" | "COMPLETE";
    explanation: string;
  };
  nextAction: RecommendedAction;
  sourceCounts: {
    documents: number;
    events: number;
  };
  boundaryNotice: string;
  generatedAt: Date;
};
