import type {
  DocumentCategory,
  EvidenceRequestedFromType,
  EvidenceRequirementStatus,
} from "@prisma/client";

import { findClaimByNumber } from "@/server/repositories/claim-repository";
import {
  createEvidenceRequirementRecord,
  listEvidenceRequirementRecords,
  updateEvidenceRequirementStatusRecord,
} from "@/server/repositories/evidence-requirement-repository";

export async function getClaimEvidenceRequirements(claimId: string) {
  return listEvidenceRequirementRecords(claimId);
}

export async function createClaimEvidenceRequirement(input: {
  claimNumber: string;
  category: DocumentCategory;
  title: string;
  description?: string | null;
  requestedFrom?: string | null;
  requestedFromType?: EvidenceRequestedFromType | null;
  dueDate?: Date | null;
  followUpDate?: Date | null;
  blockingDetermination: boolean;
  createdByName?: string | null;
}) {
  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");
  if (!input.title.trim()) throw new Error("Evidence requirement title is required.");

  return createEvidenceRequirementRecord({
    claimId: claim.id,
    category: input.category,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    requestedFrom: input.requestedFrom?.trim() || null,
    requestedFromType: input.requestedFromType ?? null,
    dueDate: input.dueDate ?? null,
    followUpDate: input.followUpDate ?? null,
    blockingDetermination: input.blockingDetermination,
    createdByName: input.createdByName ?? null,
  });
}

export async function updateClaimEvidenceRequirementStatus(input: {
  id: string;
  status: EvidenceRequirementStatus;
  updatedByName?: string | null;
}) {
  return updateEvidenceRequirementStatusRecord(input);
}
