import type {
  DocumentCategory,
  EvidenceRequestedFromType,
  EvidenceRequirementStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

export type CreateEvidenceRequirementRecordInput = {
  claimId: string;
  category: DocumentCategory;
  title: string;
  description?: string | null;
  requestedFrom?: string | null;
  requestedFromType?: EvidenceRequestedFromType | null;
  dueDate?: Date | null;
  followUpDate?: Date | null;
  blockingDetermination: boolean;
  createdByName?: string | null;
};

export async function listEvidenceRequirementRecords(claimId: string) {
  return db.evidenceRequirement.findMany({
    where: { claimId, deletedAt: null },
    include: {
      links: {
        include: {
          document: true,
          communication: true,
        },
      },
    },
    orderBy: [
      { blockingDetermination: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createEvidenceRequirementRecord(
  input: CreateEvidenceRequirementRecordInput,
) {
  return db.evidenceRequirement.create({ data: input });
}

export async function updateEvidenceRequirementStatusRecord(input: {
  id: string;
  status: EvidenceRequirementStatus;
  updatedByName?: string | null;
}) {
  return db.evidenceRequirement.update({
    where: { id: input.id },
    data: {
      status: input.status,
      updatedByName: input.updatedByName,
      requestedAt: input.status === "REQUESTED" ? new Date() : undefined,
      completedAt:
        input.status === "RECEIVED" || input.status === "NOT_REQUIRED"
          ? new Date()
          : null,
    },
  });
}
