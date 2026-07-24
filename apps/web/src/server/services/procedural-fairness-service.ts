import { randomUUID } from "node:crypto";

import { ClaimEventType, type Prisma } from "@prisma/client";

import { findClaimByNumber } from "@/server/repositories/claim-repository";
import { createClaimEvent, getClaimEvents } from "@/server/services/claim-event-service";

export const PROCEDURAL_FAIRNESS_STATUSES = [
  "REQUIRED",
  "DRAFTING",
  "ISSUED",
  "AWAITING_RESPONSE",
  "RESPONSE_RECEIVED",
  "CLOSED",
  "NOT_REQUIRED",
] as const;

export type ProceduralFairnessStatus = (typeof PROCEDURAL_FAIRNESS_STATUSES)[number];
export type ProceduralFairnessRecipient = "WORKER" | "EMPLOYER" | "OTHER";

export type ProceduralFairnessWorkflow = {
  id: string;
  recipientType: ProceduralFairnessRecipient;
  recipientName: string | null;
  status: ProceduralFairnessStatus;
  summary: string;
  issues: string[];
  issuedAt: Date | null;
  dueDate: Date | null;
  extensionDate: Date | null;
  responseReceivedAt: Date | null;
  lastUpdatedAt: Date;
  explanation: string;
};

type WorkflowMetadata = {
  workflowKind: "PROCEDURAL_FAIRNESS";
  workflowId: string;
  recipientType: ProceduralFairnessRecipient;
  recipientName?: string | null;
  status: ProceduralFairnessStatus;
  summary: string;
  issues: string[];
  issuedAt?: string | null;
  dueDate?: string | null;
  extensionDate?: string | null;
  responseReceivedAt?: string | null;
  explanation: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMetadata(value: Prisma.JsonValue | null): WorkflowMetadata | null {
  if (!isRecord(value) || value.workflowKind !== "PROCEDURAL_FAIRNESS") return null;
  if (typeof value.workflowId !== "string" || typeof value.status !== "string") return null;
  if (!PROCEDURAL_FAIRNESS_STATUSES.includes(value.status as ProceduralFairnessStatus)) return null;

  return {
    workflowKind: "PROCEDURAL_FAIRNESS",
    workflowId: value.workflowId,
    recipientType:
      value.recipientType === "EMPLOYER" || value.recipientType === "OTHER" ? value.recipientType : "WORKER",
    recipientName: typeof value.recipientName === "string" ? value.recipientName : null,
    status: value.status as ProceduralFairnessStatus,
    summary: typeof value.summary === "string" ? value.summary : "",
    issues: Array.isArray(value.issues) ? value.issues.filter((issue): issue is string => typeof issue === "string") : [],
    issuedAt: typeof value.issuedAt === "string" ? value.issuedAt : null,
    dueDate: typeof value.dueDate === "string" ? value.dueDate : null,
    extensionDate: typeof value.extensionDate === "string" ? value.extensionDate : null,
    responseReceivedAt: typeof value.responseReceivedAt === "string" ? value.responseReceivedAt : null,
    explanation: typeof value.explanation === "string" ? value.explanation : "",
  };
}

function dateOrNull(value?: string | null) {
  return value ? new Date(value) : null;
}

export async function listProceduralFairnessWorkflows(claimId: string) {
  const events = await getClaimEvents(claimId);
  const latest = new Map<string, ProceduralFairnessWorkflow>();

  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    if (!metadata || latest.has(metadata.workflowId)) continue;

    latest.set(metadata.workflowId, {
      id: metadata.workflowId,
      recipientType: metadata.recipientType,
      recipientName: metadata.recipientName ?? null,
      status: metadata.status,
      summary: metadata.summary,
      issues: metadata.issues,
      issuedAt: dateOrNull(metadata.issuedAt),
      dueDate: dateOrNull(metadata.dueDate),
      extensionDate: dateOrNull(metadata.extensionDate),
      responseReceivedAt: dateOrNull(metadata.responseReceivedAt),
      lastUpdatedAt: event.occurredAt,
      explanation: metadata.explanation,
    });
  }

  return [...latest.values()].sort((a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime());
}

export async function createProceduralFairnessWorkflow(input: {
  claimNumber: string;
  recipientType: ProceduralFairnessRecipient;
  recipientName?: string | null;
  summary: string;
  issues: string[];
  dueDate?: Date | null;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  if (!input.summary.trim()) throw new Error("A procedural fairness summary is required.");

  const workflowId = randomUUID();
  const metadata: WorkflowMetadata = {
    workflowKind: "PROCEDURAL_FAIRNESS",
    workflowId,
    recipientType: input.recipientType,
    recipientName: input.recipientName?.trim() || null,
    status: "REQUIRED",
    summary: input.summary.trim(),
    issues: input.issues.map((issue) => issue.trim()).filter(Boolean),
    dueDate: input.dueDate?.toISOString() ?? null,
    explanation: "Procedural fairness has been identified and requires action before the investigation can be finalised.",
  };

  await createClaimEvent({
    claimId: claim.id,
    type: ClaimEventType.GENERAL,
    title: "Procedural fairness required",
    description: metadata.summary,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });

  return workflowId;
}

export async function updateProceduralFairnessWorkflow(input: {
  claimNumber: string;
  workflowId: string;
  status: ProceduralFairnessStatus;
  issuedAt?: Date | null;
  dueDate?: Date | null;
  extensionDate?: Date | null;
  responseReceivedAt?: Date | null;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");

  const workflows = await listProceduralFairnessWorkflows(claim.id);
  const current = workflows.find((workflow) => workflow.id === input.workflowId);
  if (!current) throw new Error("Procedural fairness workflow not found.");

  const issuedAt = input.issuedAt ?? current.issuedAt;
  const dueDate = input.dueDate ?? current.dueDate;
  const extensionDate = input.extensionDate ?? current.extensionDate;
  const responseReceivedAt = input.responseReceivedAt ?? current.responseReceivedAt;

  const metadata: WorkflowMetadata = {
    workflowKind: "PROCEDURAL_FAIRNESS",
    workflowId: current.id,
    recipientType: current.recipientType,
    recipientName: current.recipientName,
    status: input.status,
    summary: current.summary,
    issues: current.issues,
    issuedAt: issuedAt?.toISOString() ?? null,
    dueDate: dueDate?.toISOString() ?? null,
    extensionDate: extensionDate?.toISOString() ?? null,
    responseReceivedAt: responseReceivedAt?.toISOString() ?? null,
    explanation: `Procedural fairness workflow moved to ${input.status.toLowerCase().replaceAll("_", " ")}.`,
  };

  const eventType = input.status === "ISSUED" || input.status === "AWAITING_RESPONSE"
    ? ClaimEventType.NATURAL_JUSTICE_ISSUED
    : input.status === "RESPONSE_RECEIVED"
      ? current.recipientType === "EMPLOYER"
        ? ClaimEventType.EMPLOYER_RESPONSE_RECEIVED
        : ClaimEventType.WORKER_RESPONSE_RECEIVED
      : ClaimEventType.GENERAL;

  await createClaimEvent({
    claimId: claim.id,
    type: eventType,
    title: `Procedural fairness: ${input.status.toLowerCase().replaceAll("_", " ")}`,
    description: current.summary,
    metadata: metadata as unknown as Prisma.InputJsonValue,
  });
}
