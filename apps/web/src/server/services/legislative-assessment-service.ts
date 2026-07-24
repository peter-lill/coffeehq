import { ClaimEventType, type Prisma } from "@prisma/client";

import {
  LEGISLATIVE_ELEMENTS,
  type LegislativeAssessmentRecord,
  type LegislativeAssessmentStatus,
  type LegislativeElementKey,
} from "@/server/domain/decision/legislative-assessment";
import { findClaimByNumber } from "@/server/repositories/claim-repository";
import { createClaimEvent, getClaimEvents } from "@/server/services/claim-event-service";

const STATUSES: LegislativeAssessmentStatus[] = [
  "SATISFIED",
  "NOT_SATISFIED",
  "NOT_APPLICABLE",
  "NOT_ASSESSED",
];
const ELEMENT_KEYS = LEGISLATIVE_ELEMENTS.map((element) => element.key);

type LegislativeAssessmentMetadata = {
  workflowKind: "LEGISLATIVE_ASSESSMENT";
  elementKey: LegislativeElementKey;
  status: LegislativeAssessmentStatus;
  reasons: string;
  evidenceSummary: string;
  linkedFactorKeys: string[];
  assessedBy: string;
  assessedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMetadata(value: Prisma.JsonValue | null): LegislativeAssessmentMetadata | null {
  if (!isRecord(value) || value.workflowKind !== "LEGISLATIVE_ASSESSMENT") return null;
  if (typeof value.elementKey !== "string" || typeof value.status !== "string") return null;
  if (!ELEMENT_KEYS.includes(value.elementKey as LegislativeElementKey)) return null;
  if (!STATUSES.includes(value.status as LegislativeAssessmentStatus)) return null;

  return {
    workflowKind: "LEGISLATIVE_ASSESSMENT",
    elementKey: value.elementKey as LegislativeElementKey,
    status: value.status as LegislativeAssessmentStatus,
    reasons: typeof value.reasons === "string" ? value.reasons : "",
    evidenceSummary: typeof value.evidenceSummary === "string" ? value.evidenceSummary : "",
    linkedFactorKeys: Array.isArray(value.linkedFactorKeys)
      ? value.linkedFactorKeys.filter((item): item is string => typeof item === "string")
      : [],
    assessedBy: typeof value.assessedBy === "string" ? value.assessedBy : "",
    assessedAt: typeof value.assessedAt === "string" ? value.assessedAt : null,
  };
}

export async function listLegislativeAssessments(claimId: string) {
  const events = await getClaimEvents(claimId);
  const latest = new Map<LegislativeElementKey, LegislativeAssessmentRecord>();

  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    if (!metadata || latest.has(metadata.elementKey)) continue;

    latest.set(metadata.elementKey, {
      elementKey: metadata.elementKey,
      status: metadata.status,
      reasons: metadata.reasons,
      evidenceSummary: metadata.evidenceSummary,
      linkedFactorKeys: metadata.linkedFactorKeys,
      assessedBy: metadata.assessedBy,
      assessedAt: metadata.assessedAt ? new Date(metadata.assessedAt) : null,
    });
  }

  return [...latest.values()];
}

export async function recordLegislativeAssessment(input: {
  claimNumber: string;
  elementKey: LegislativeElementKey;
  status: LegislativeAssessmentStatus;
  reasons: string;
  evidenceSummary: string;
  linkedFactorKeys: string[];
  assessedBy: string;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error(`Claim ${input.claimNumber} was not found.`);
  if (!ELEMENT_KEYS.includes(input.elementKey)) throw new Error("Invalid legislative element.");
  if (!STATUSES.includes(input.status)) throw new Error("Invalid legislative assessment status.");

  const element = LEGISLATIVE_ELEMENTS.find((item) => item.key === input.elementKey);
  const assessedAt = input.status === "NOT_ASSESSED" ? null : new Date();

  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: `Legislative assessment updated: ${element?.label ?? input.elementKey}`,
    description:
      input.status === "NOT_ASSESSED"
        ? "Legislative assessment cleared."
        : `${input.status.replaceAll("_", " ")} recorded by ${input.assessedBy || "an authorised user"}.`,
    occurredAt: new Date(),
    metadata: {
      workflowKind: "LEGISLATIVE_ASSESSMENT",
      elementKey: input.elementKey,
      status: input.status,
      reasons: input.reasons.trim(),
      evidenceSummary: input.evidenceSummary.trim(),
      linkedFactorKeys: input.linkedFactorKeys.map((value) => value.trim()).filter(Boolean),
      assessedBy: input.assessedBy.trim(),
      assessedAt: assessedAt?.toISOString() ?? null,
    },
  });
}
