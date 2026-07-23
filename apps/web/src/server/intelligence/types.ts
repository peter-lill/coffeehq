export const intelligenceSpecialistIds = [
  "EVIDENCE_ANALYST",
  "CHRONOLOGY_ANALYST",
  "MEDICAL_ANALYST",
  "ISSUE_ANALYST",
  "RELATIONSHIP_MAPPER",
  "SUMMARY_WRITER",
  "COMMUNICATIONS_ASSISTANT",
] as const;

export type IntelligenceSpecialistId = (typeof intelligenceSpecialistIds)[number];

export type IntelligenceCapability =
  | "extract_evidence"
  | "classify_evidence"
  | "build_chronology"
  | "summarise_medical_material"
  | "identify_issues"
  | "map_relationships"
  | "draft_summary"
  | "draft_communication";

export type IntelligenceRequest = {
  organisationId: string;
  investigationId: string;
  requestedByUserId: string;
  capability: IntelligenceCapability;
  inputRecordIds: string[];
  instructions?: string;
};

export type IntelligenceCitation = {
  recordId: string;
  excerpt?: string;
};

export type IntelligenceResult = {
  requestId: string;
  specialistId: IntelligenceSpecialistId;
  capability: IntelligenceCapability;
  status: "COMPLETED" | "REQUIRES_REVIEW" | "FAILED";
  output: unknown;
  citations: IntelligenceCitation[];
  confidence?: number;
  warnings: string[];
  generatedAt: Date;
  serviceVersion: string;
};

export type IntelligenceSpecialist = {
  id: IntelligenceSpecialistId;
  name: string;
  description: string;
  capabilities: readonly IntelligenceCapability[];
  serviceVersion: string;
  mayDetermineLiability: false;
  execute(request: IntelligenceRequest): Promise<IntelligenceResult>;
};
