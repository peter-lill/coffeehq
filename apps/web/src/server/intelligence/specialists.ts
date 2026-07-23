import type {
  IntelligenceCapability,
  IntelligenceRequest,
  IntelligenceResult,
  IntelligenceSpecialist,
  IntelligenceSpecialistId,
} from "./types";

type SpecialistDefinition = Omit<IntelligenceSpecialist, "execute">;

export const specialistDefinitions: readonly SpecialistDefinition[] = [
  {
    id: "EVIDENCE_ANALYST",
    name: "Evidence Analyst",
    description: "Extracts and classifies facts from evidence while preserving source references.",
    capabilities: ["extract_evidence", "classify_evidence"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "CHRONOLOGY_ANALYST",
    name: "Chronology Analyst",
    description: "Builds dated event sequences from referenced records.",
    capabilities: ["build_chronology"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "MEDICAL_ANALYST",
    name: "Medical Analyst",
    description: "Summarises medical material without making or replacing clinical opinions.",
    capabilities: ["summarise_medical_material"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "ISSUE_ANALYST",
    name: "Issue Analyst",
    description: "Identifies alleged issues and links supporting and contrary evidence.",
    capabilities: ["identify_issues"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "RELATIONSHIP_MAPPER",
    name: "Relationship Mapper",
    description: "Maps relationships between records, issues, people and events.",
    capabilities: ["map_relationships"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "SUMMARY_WRITER",
    name: "Summary Writer",
    description: "Drafts investigation summaries from approved records and citations.",
    capabilities: ["draft_summary"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
  {
    id: "COMMUNICATIONS_ASSISTANT",
    name: "Communications Assistant",
    description: "Drafts communications and file-note text for human review.",
    capabilities: ["draft_communication"],
    serviceVersion: "1.0.0",
    mayDetermineLiability: false,
  },
] as const;

export function findSpecialistDefinition(capability: IntelligenceCapability) {
  return specialistDefinitions.find((specialist) =>
    specialist.capabilities.includes(capability),
  );
}

export function createUnavailableSpecialist(
  id: IntelligenceSpecialistId,
): IntelligenceSpecialist {
  const definition = specialistDefinitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown intelligence specialist: ${id}`);

  return {
    ...definition,
    async execute(request: IntelligenceRequest): Promise<IntelligenceResult> {
      return {
        requestId: crypto.randomUUID(),
        specialistId: id,
        capability: request.capability,
        status: "REQUIRES_REVIEW",
        output: null,
        citations: [],
        warnings: [
          "The specialist boundary is active, but no approved model provider has been configured.",
        ],
        generatedAt: new Date(),
        serviceVersion: definition.serviceVersion,
      };
    },
  };
}
