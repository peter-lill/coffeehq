import "server-only";

import { documentStorage } from "@/lib/storage/local-document-storage";
import { requireCurrentUser, requireRole } from "@/server/auth/current-user";
import type { DeletableItemType, DeletedItem } from "@/server/deleted-items/types";
import {
  findPermanentDeleteTarget,
  listDeletedRecords,
  permanentlyDeleteRecord,
  restoreDeletedRecord,
  softDeleteRecord,
} from "@/server/repositories/deleted-items-repository";

function validReason(value: string) {
  const reason = value.trim();
  if (reason.length < 3) throw new Error("Enter a reason for deletion.");
  return reason;
}

export async function softDeleteItem(input: {
  type: DeletableItemType;
  id: string;
  reason: string;
}) {
  const user = await requireCurrentUser();
  const result = await softDeleteRecord({
    ...input,
    userId: user.id,
    organisationId: user.organisationId,
    canReviewUnmatched: user.role === "ADMIN" || user.role === "MANAGER",
    deletedByName: user.name,
    reason: validReason(input.reason),
  });
  if (result.count !== 1) throw new Error("The item could not be deleted.");
}

export async function getDeletedItems(): Promise<DeletedItem[]> {
  const user = await requireCurrentUser();
  const records = await listDeletedRecords({
    userId: user.id,
    organisationId: user.organisationId,
    canReviewUnmatched: user.role === "ADMIN" || user.role === "MANAGER",
  });
  const items: DeletedItem[] = [];

  for (const claim of records.claims) {
    if (!claim.deletedAt) continue;
    items.push({
      id: claim.id,
      type: "CLAIM",
      title: `${claim.claimNumber} — ${claim.claimantName}`,
      detail: claim.injury,
      claimNumber: claim.claimNumber,
      claimantName: claim.claimantName,
      deletedAt: claim.deletedAt,
      deletedByName: claim.deletedByName,
      deletionReason: claim.deletionReason,
    });
  }
  for (const document of records.documents) {
    if (!document.deletedAt) continue;
    items.push({
      id: document.id,
      type: "DOCUMENT",
      title: document.originalName,
      detail: "Document",
      claimNumber: document.claim.claimNumber,
      claimantName: document.claim.claimantName,
      deletedAt: document.deletedAt,
      deletedByName: document.deletedByName,
      deletionReason: document.deletionReason,
    });
  }
  for (const communication of records.communications) {
    if (!communication.deletedAt) continue;
    items.push({
      id: communication.id,
      type: "COMMUNICATION",
      title: communication.subject,
      detail: `Email from ${communication.sender}`,
      claimNumber: communication.claim?.claimNumber ?? null,
      claimantName: communication.claim?.claimantName ?? null,
      deletedAt: communication.deletedAt,
      deletedByName: communication.deletedByName,
      deletionReason: communication.deletionReason,
    });
  }
  for (const requirement of records.requirements) {
    if (!requirement.deletedAt) continue;
    items.push({
      id: requirement.id,
      type: "EVIDENCE_REQUIREMENT",
      title: requirement.title,
      detail: "Evidence requirement",
      claimNumber: requirement.claim.claimNumber,
      claimantName: requirement.claim.claimantName,
      deletedAt: requirement.deletedAt,
      deletedByName: requirement.deletedByName,
      deletionReason: requirement.deletionReason,
    });
  }

  return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

export async function restoreDeletedItem(input: {
  type: DeletableItemType;
  id: string;
}) {
  const user = await requireCurrentUser();
  const result = await restoreDeletedRecord({
    ...input,
    userId: user.id,
    organisationId: user.organisationId,
    canReviewUnmatched: user.role === "ADMIN" || user.role === "MANAGER",
  });
  if (result.count !== 1) throw new Error("The item could not be restored.");
}

export async function permanentlyDeleteItem(input: {
  type: DeletableItemType;
  id: string;
}) {
  const user = await requireRole(["ADMIN"]);
  const target = await findPermanentDeleteTarget({
    ...input,
    userId: user.id,
    organisationId: user.organisationId,
  });
  if (!target) throw new Error("The deleted item could not be found.");

  const storageKeys: string[] = [];
  if (input.type === "CLAIM" && "documents" in target) {
    storageKeys.push(...target.documents.map((item) => item.storageKey));
    storageKeys.push(
      ...target.communications
        .map((item) => item.rawStorageKey)
        .filter((value): value is string => Boolean(value)),
    );
  } else if (input.type === "DOCUMENT" && "storageKey" in target) {
    storageKeys.push(target.storageKey);
  } else if (input.type === "COMMUNICATION" && "rawStorageKey" in target && target.rawStorageKey) {
    storageKeys.push(target.rawStorageKey);
  }

  await permanentlyDeleteRecord(input);
  await Promise.allSettled(storageKeys.map((key) => documentStorage.delete(key)));
}
