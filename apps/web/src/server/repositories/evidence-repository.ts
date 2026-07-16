import type {
  DocumentCategory,
  EvidenceRequirementStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

export async function listEvidenceDocumentRecords(claimId: string) {
  return db.document.findMany({
    where: { claimId },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      source: true,
      category: true,
      createdAt: true,
      communication: {
        select: {
          id: true,
          subject: true,
          sender: true,
          receivedAt: true,
        },
      },
    },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });
}

export async function listEvidenceCommunicationRecords(claimId: string) {
  return db.communication.findMany({
    where: { claimId },
    select: {
      id: true,
      subject: true,
      sender: true,
      receivedAt: true,
      status: true,
      _count: {
        select: { documents: true },
      },
    },
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function listEvidenceRequirementRecords(claimId: string) {
  return db.evidenceRequirement.findMany({
    where: { claimId },
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createEvidenceRequirementRecord(input: {
  claimId: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  requestedFrom?: string;
  dueDate?: Date;
  operatorName?: string;
}) {
  return db.$transaction(async (transaction) => {
    const requirement = await transaction.evidenceRequirement.create({
      data: {
        claimId: input.claimId,
        category: input.category,
        title: input.title,
        description: input.description,
        requestedFrom: input.requestedFrom,
        dueDate: input.dueDate,
        createdByName: input.operatorName,
        updatedByName: input.operatorName,
      },
    });

    await transaction.claimEvent.create({
      data: {
        claimId: input.claimId,
        type: "EVIDENCE_REQUIREMENT_CREATED",
        title: "Evidence requirement added",
        description: input.title,
        metadata: {
          requirementId: requirement.id,
          category: input.category,
          requestedFrom: input.requestedFrom ?? null,
          dueDate: input.dueDate?.toISOString() ?? null,
          operatorName: input.operatorName ?? null,
        },
      },
    });

    return requirement;
  });
}

export async function updateEvidenceRequirementStatusRecord(input: {
  claimId: string;
  requirementId: string;
  status: EvidenceRequirementStatus;
  operatorName?: string;
}) {
  return db.$transaction(async (transaction) => {
    const existing = await transaction.evidenceRequirement.findFirst({
      where: {
        id: input.requirementId,
        claimId: input.claimId,
      },
    });

    if (!existing) {
      throw new Error("The evidence requirement could not be found.");
    }

    const completedAt =
      input.status === "RECEIVED" || input.status === "NOT_REQUIRED"
        ? new Date()
        : null;

    const requirement = await transaction.evidenceRequirement.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        completedAt,
        updatedByName: input.operatorName,
      },
    });

    await transaction.claimEvent.create({
      data: {
        claimId: input.claimId,
        type: "EVIDENCE_REQUIREMENT_UPDATED",
        title: "Evidence requirement updated",
        description: requirement.title,
        metadata: {
          requirementId: requirement.id,
          previousStatus: existing.status,
          newStatus: requirement.status,
          operatorName: input.operatorName ?? null,
        },
      },
    });

    return requirement;
  });
}

export async function listEvidenceDashboardRecords() {
  return db.claim.findMany({
    select: {
      id: true,
      claimNumber: true,
      claimantName: true,
      status: true,
      _count: {
        select: {
          documents: true,
          communications: true,
        },
      },
      evidenceRequirements: {
        where: {
          status: { in: ["OUTSTANDING", "REQUESTED"] },
        },
        select: { status: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { claimNumber: "asc" }],
  });
}
