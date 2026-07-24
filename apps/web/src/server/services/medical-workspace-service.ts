import { randomUUID } from "node:crypto";

import { ClaimEventType, type Prisma } from "@prisma/client";

import { findClaimByNumber } from "@/server/repositories/claim-repository";
import { createClaimEvent, getClaimEvents } from "@/server/services/claim-event-service";

export const MEDICAL_RECORD_STATUSES = ["CURRENT", "CLARIFICATION_REQUIRED", "SUPERSEDED", "CLOSED"] as const;
export const PRACTITIONER_TYPES = ["GP", "PSYCHOLOGIST", "PSYCHIATRIST", "IME", "CAE", "OTHER"] as const;

export type MedicalRecordStatus = (typeof MEDICAL_RECORD_STATUSES)[number];
export type PractitionerType = (typeof PRACTITIONER_TYPES)[number];

export type MedicalWorkspaceRecord = {
  id: string;
  practitionerType: PractitionerType;
  practitionerName: string;
  reportDate: Date | null;
  status: MedicalRecordStatus;
  diagnosis: string;
  capacity: string;
  causativeFactors: string[];
  workContributionOpinion: string;
  treatment: string;
  restrictions: string;
  clarificationQuestions: string[];
  notes: string;
  lastUpdatedAt: Date;
};

type MedicalMetadata = Omit<MedicalWorkspaceRecord, "id" | "reportDate" | "lastUpdatedAt"> & {
  workflowKind: "MEDICAL_WORKSPACE";
  recordId: string;
  reportDate?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseMetadata(value: Prisma.JsonValue | null): MedicalMetadata | null {
  if (!isRecord(value) || value.workflowKind !== "MEDICAL_WORKSPACE") return null;
  if (typeof value.recordId !== "string" || typeof value.practitionerName !== "string") return null;
  return {
    workflowKind: "MEDICAL_WORKSPACE",
    recordId: value.recordId,
    practitionerType: PRACTITIONER_TYPES.includes(value.practitionerType as PractitionerType) ? value.practitionerType as PractitionerType : "OTHER",
    practitionerName: value.practitionerName,
    reportDate: typeof value.reportDate === "string" ? value.reportDate : null,
    status: MEDICAL_RECORD_STATUSES.includes(value.status as MedicalRecordStatus) ? value.status as MedicalRecordStatus : "CURRENT",
    diagnosis: typeof value.diagnosis === "string" ? value.diagnosis : "",
    capacity: typeof value.capacity === "string" ? value.capacity : "",
    causativeFactors: strings(value.causativeFactors),
    workContributionOpinion: typeof value.workContributionOpinion === "string" ? value.workContributionOpinion : "",
    treatment: typeof value.treatment === "string" ? value.treatment : "",
    restrictions: typeof value.restrictions === "string" ? value.restrictions : "",
    clarificationQuestions: strings(value.clarificationQuestions),
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

export async function listMedicalWorkspaceRecords(claimId: string) {
  const events = await getClaimEvents(claimId);
  const latest = new Map<string, MedicalWorkspaceRecord>();
  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    if (!metadata || latest.has(metadata.recordId)) continue;
    latest.set(metadata.recordId, {
      id: metadata.recordId,
      practitionerType: metadata.practitionerType,
      practitionerName: metadata.practitionerName,
      reportDate: metadata.reportDate ? new Date(metadata.reportDate) : null,
      status: metadata.status,
      diagnosis: metadata.diagnosis,
      capacity: metadata.capacity,
      causativeFactors: metadata.causativeFactors,
      workContributionOpinion: metadata.workContributionOpinion,
      treatment: metadata.treatment,
      restrictions: metadata.restrictions,
      clarificationQuestions: metadata.clarificationQuestions,
      notes: metadata.notes,
      lastUpdatedAt: event.occurredAt,
    });
  }
  return [...latest.values()].sort((a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime());
}

export async function createMedicalWorkspaceRecord(input: {
  claimNumber: string;
  practitionerType: PractitionerType;
  practitionerName: string;
  reportDate?: Date | null;
  diagnosis?: string;
  capacity?: string;
  causativeFactors: string[];
  workContributionOpinion?: string;
  treatment?: string;
  restrictions?: string;
  clarificationQuestions: string[];
  notes?: string;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  if (!input.practitionerName.trim()) throw new Error("Practitioner name is required.");
  const recordId = randomUUID();
  const metadata: MedicalMetadata = {
    workflowKind: "MEDICAL_WORKSPACE",
    recordId,
    practitionerType: input.practitionerType,
    practitionerName: input.practitionerName.trim(),
    reportDate: input.reportDate?.toISOString() ?? null,
    status: input.clarificationQuestions.length ? "CLARIFICATION_REQUIRED" : "CURRENT",
    diagnosis: input.diagnosis?.trim() || "",
    capacity: input.capacity?.trim() || "",
    causativeFactors: input.causativeFactors,
    workContributionOpinion: input.workContributionOpinion?.trim() || "",
    treatment: input.treatment?.trim() || "",
    restrictions: input.restrictions?.trim() || "",
    clarificationQuestions: input.clarificationQuestions,
    notes: input.notes?.trim() || "",
  };
  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.MEDICAL_EVIDENCE_RECEIVED,
    title: `Medical evidence recorded: ${metadata.practitionerName}`,
    description: metadata.diagnosis || metadata.workContributionOpinion || "Medical evidence added to the claim record.",
    occurredAt: input.reportDate ?? undefined,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });
  return recordId;
}

export async function updateMedicalWorkspaceRecord(input: {
  claimNumber: string;
  recordId: string;
  status: MedicalRecordStatus;
  diagnosis?: string;
  capacity?: string;
  causativeFactors: string[];
  workContributionOpinion?: string;
  treatment?: string;
  restrictions?: string;
  clarificationQuestions: string[];
  notes?: string;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  const current = (await listMedicalWorkspaceRecords(claim.id)).find((record) => record.id === input.recordId);
  if (!current) throw new Error("Medical record not found.");
  const metadata: MedicalMetadata = {
    workflowKind: "MEDICAL_WORKSPACE",
    recordId: current.id,
    practitionerType: current.practitionerType,
    practitionerName: current.practitionerName,
    reportDate: current.reportDate?.toISOString() ?? null,
    status: input.status,
    diagnosis: input.diagnosis?.trim() || current.diagnosis,
    capacity: input.capacity?.trim() || current.capacity,
    causativeFactors: input.causativeFactors,
    workContributionOpinion: input.workContributionOpinion?.trim() || current.workContributionOpinion,
    treatment: input.treatment?.trim() || current.treatment,
    restrictions: input.restrictions?.trim() || current.restrictions,
    clarificationQuestions: input.clarificationQuestions,
    notes: input.notes?.trim() || current.notes,
  };
  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: `Medical record: ${input.status.toLowerCase().replaceAll("_", " ")}`,
    description: current.practitionerName,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });
}
