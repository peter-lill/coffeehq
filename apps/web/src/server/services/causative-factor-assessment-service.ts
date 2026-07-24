import { ClaimEventType, type Prisma } from "@prisma/client";

import type {
  CausativeFactorAssessment,
  SubstantiationStatus,
} from "@/server/domain/decision/causative-factors";
import { findClaimByNumber } from "@/server/repositories/claim-repository";
import { createClaimEvent, getClaimEvents } from "@/server/services/claim-event-service";

const STATUSES: SubstantiationStatus[] = [
  "SUBSTANTIATED",
  "PARTIALLY_SUBSTANTIATED",
  "UNSUBSTANTIATED",
  "NOT_ASSESSED",
];

type AssessmentMetadata = {
  workflowKind: "CAUSATIVE_FACTOR_ASSESSMENT";
  factorKey: string;
  status: SubstantiationStatus;
  reasons: string;
  assessedBy: string;
  assessedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMetadata(value: Prisma.JsonValue | null): AssessmentMetadata | null {
  if (!isRecord(value) || value.workflowKind !== "CAUSATIVE_FACTOR_ASSESSMENT") return null;
  if (typeof value.factorKey !== "string" || typeof value.status !== "string") return null;
  if (!STATUSES.includes(value.status as SubstantiationStatus)) return null;

  return {
    workflowKind: "CAUSATIVE_FACTOR_ASSESSMENT",
    factorKey: value.factorKey,
    status: value.status as SubstantiationStatus,
    reasons: typeof value.reasons === "string" ? value.reasons : "",
    assessedBy: typeof value.assessedBy === "string" ? value.assessedBy : "",
    assessedAt: typeof value.assessedAt === "string" ? value.assessedAt : null,
  };
}

function factorId(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-AU");
}

export async function listCausativeFactorAssessments(claimId: string) {
  const events = await getClaimEvents(claimId);
  const latest = new Map<string, CausativeFactorAssessment>();

  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    if (!metadata) continue;
    const id = factorId(metadata.factorKey);
    if (latest.has(id)) continue;

    latest.set(id, {
      factorKey: metadata.factorKey,
      status: metadata.status,
      reasons: metadata.reasons,
      assessedBy: metadata.assessedBy,
      assessedAt: metadata.assessedAt ? new Date(metadata.assessedAt) : null,
    });
  }

  return [...latest.values()];
}

export async function recordCausativeFactorAssessment(input: {
  claimNumber: string;
  factorKey: string;
  status: SubstantiationStatus;
  reasons: string;
  assessedBy: string;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error(`Claim ${input.claimNumber} was not found.`);
  if (!STATUSES.includes(input.status)) throw new Error("Invalid substantiation status.");

  const factorKey = input.factorKey.trim().replace(/\s+/g, " ");
  const assessedAt = input.status === "NOT_ASSESSED" ? null : new Date();

  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: `Causative factor assessment updated: ${factorKey}`,
    description:
      input.status === "NOT_ASSESSED"
        ? "Substantiation finding cleared."
        : `${input.status.replaceAll("_", " ")} finding recorded by ${input.assessedBy || "an authorised user"}.`,
    occurredAt: new Date(),
    metadata: {
      workflowKind: "CAUSATIVE_FACTOR_ASSESSMENT",
      factorKey,
      status: input.status,
      reasons: input.reasons.trim(),
      assessedBy: input.assessedBy.trim(),
      assessedAt: assessedAt?.toISOString() ?? null,
    },
  });
}
