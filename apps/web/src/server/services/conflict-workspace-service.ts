import { randomUUID } from "node:crypto";

import { ClaimEventType, type Prisma } from "@prisma/client";

import { findClaimByNumber } from "@/server/repositories/claim-repository";
import { createClaimEvent, getClaimEvents } from "@/server/services/claim-event-service";

export const CONFLICT_STATUSES = ["OPEN", "EVIDENCE_REQUIRED", "PROCEDURAL_FAIRNESS", "RESOLVED", "NOT_RELEVANT"] as const;
export type ConflictStatus = (typeof CONFLICT_STATUSES)[number];

export type ConflictRecord = {
  id: string;
  issue: string;
  causativeFactor: string | null;
  workerPosition: string;
  employerPosition: string;
  witnessEvidence: string;
  objectiveEvidence: string;
  outstandingEvidence: string[];
  status: ConflictStatus;
  finding: string | null;
  decisionRelevance: string | null;
  lastUpdatedAt: Date;
};

type ConflictMetadata = {
  workflowKind: "CONFLICT_WORKSPACE";
  conflictId: string;
  issue: string;
  causativeFactor?: string | null;
  workerPosition: string;
  employerPosition: string;
  witnessEvidence: string;
  objectiveEvidence: string;
  outstandingEvidence: string[];
  status: ConflictStatus;
  finding?: string | null;
  decisionRelevance?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMetadata(value: Prisma.JsonValue | null): ConflictMetadata | null {
  if (!isRecord(value) || value.workflowKind !== "CONFLICT_WORKSPACE") return null;
  if (typeof value.conflictId !== "string" || typeof value.issue !== "string" || typeof value.status !== "string") return null;
  if (!CONFLICT_STATUSES.includes(value.status as ConflictStatus)) return null;

  return {
    workflowKind: "CONFLICT_WORKSPACE",
    conflictId: value.conflictId,
    issue: value.issue,
    causativeFactor: typeof value.causativeFactor === "string" ? value.causativeFactor : null,
    workerPosition: typeof value.workerPosition === "string" ? value.workerPosition : "",
    employerPosition: typeof value.employerPosition === "string" ? value.employerPosition : "",
    witnessEvidence: typeof value.witnessEvidence === "string" ? value.witnessEvidence : "",
    objectiveEvidence: typeof value.objectiveEvidence === "string" ? value.objectiveEvidence : "",
    outstandingEvidence: Array.isArray(value.outstandingEvidence)
      ? value.outstandingEvidence.filter((item): item is string => typeof item === "string")
      : [],
    status: value.status as ConflictStatus,
    finding: typeof value.finding === "string" ? value.finding : null,
    decisionRelevance: typeof value.decisionRelevance === "string" ? value.decisionRelevance : null,
  };
}

export async function listConflictRecords(claimId: string) {
  const events = await getClaimEvents(claimId);
  const latest = new Map<string, ConflictRecord>();

  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    if (!metadata || latest.has(metadata.conflictId)) continue;
    latest.set(metadata.conflictId, {
      id: metadata.conflictId,
      issue: metadata.issue,
      causativeFactor: metadata.causativeFactor ?? null,
      workerPosition: metadata.workerPosition,
      employerPosition: metadata.employerPosition,
      witnessEvidence: metadata.witnessEvidence,
      objectiveEvidence: metadata.objectiveEvidence,
      outstandingEvidence: metadata.outstandingEvidence,
      status: metadata.status,
      finding: metadata.finding ?? null,
      decisionRelevance: metadata.decisionRelevance ?? null,
      lastUpdatedAt: event.occurredAt,
    });
  }

  return [...latest.values()].sort((a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime());
}

export async function createConflictRecord(input: {
  claimNumber: string;
  issue: string;
  causativeFactor?: string | null;
  workerPosition?: string | null;
  employerPosition?: string | null;
  witnessEvidence?: string | null;
  objectiveEvidence?: string | null;
  outstandingEvidence?: string[];
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  if (!input.issue.trim()) throw new Error("A conflict issue is required.");

  const conflictId = randomUUID();
  const metadata: ConflictMetadata = {
    workflowKind: "CONFLICT_WORKSPACE",
    conflictId,
    issue: input.issue.trim(),
    causativeFactor: input.causativeFactor?.trim() || null,
    workerPosition: input.workerPosition?.trim() || "",
    employerPosition: input.employerPosition?.trim() || "",
    witnessEvidence: input.witnessEvidence?.trim() || "",
    objectiveEvidence: input.objectiveEvidence?.trim() || "",
    outstandingEvidence: (input.outstandingEvidence ?? []).map((item) => item.trim()).filter(Boolean),
    status: "OPEN",
    finding: null,
    decisionRelevance: null,
  };

  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: "Conflict recorded",
    description: metadata.issue,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });

  return conflictId;
}

export async function updateConflictRecord(input: {
  claimNumber: string;
  conflictId: string;
  status: ConflictStatus;
  workerPosition?: string | null;
  employerPosition?: string | null;
  witnessEvidence?: string | null;
  objectiveEvidence?: string | null;
  outstandingEvidence?: string[];
  finding?: string | null;
  decisionRelevance?: string | null;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  const current = (await listConflictRecords(claim.id)).find((item) => item.id === input.conflictId);
  if (!current) throw new Error("Conflict record not found.");

  const metadata: ConflictMetadata = {
    workflowKind: "CONFLICT_WORKSPACE",
    conflictId: current.id,
    issue: current.issue,
    causativeFactor: current.causativeFactor,
    workerPosition: input.workerPosition?.trim() ?? current.workerPosition,
    employerPosition: input.employerPosition?.trim() ?? current.employerPosition,
    witnessEvidence: input.witnessEvidence?.trim() ?? current.witnessEvidence,
    objectiveEvidence: input.objectiveEvidence?.trim() ?? current.objectiveEvidence,
    outstandingEvidence: input.outstandingEvidence ?? current.outstandingEvidence,
    status: input.status,
    finding: input.finding?.trim() || current.finding,
    decisionRelevance: input.decisionRelevance?.trim() || current.decisionRelevance,
  };

  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: `Conflict: ${input.status.toLowerCase().replaceAll("_", " ")}`,
    description: current.issue,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });
}
