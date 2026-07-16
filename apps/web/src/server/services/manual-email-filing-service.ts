import { createHash } from "node:crypto";

import type { Attachment } from "mailparser";
import { simpleParser } from "mailparser";

import { documentStorage } from "@/lib/storage/local-document-storage";
import {
  CommunicationAlreadyFiledError,
  fileCommunicationToClaimRecord,
  findClaimForManualFiling,
  findCommunicationForManualFiling,
  type ManualFilingAttachmentRecord,
} from "@/server/repositories/communication-repository";
import { findDuplicateDocumentRecord } from "@/server/repositories/document-repository";

const MAX_EMAIL_ATTACHMENT_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? "50") * 1024 * 1024;

function inferCategory(attachment: Attachment) {
  const name = attachment.filename?.toLowerCase() ?? "";
  const mimeType = attachment.contentType?.toLowerCase() ?? "";

  if (name.includes("payroll") || name.includes("timesheet")) {
    return "PAYROLL" as const;
  }
  if (
    name.includes("medical") ||
    name.includes("certificate") ||
    name.includes("doctor")
  ) {
    return "MEDICAL" as const;
  }
  if (name.includes("employer")) return "EMPLOYER" as const;
  if (name.includes("worker") || name.includes("claimant")) {
    return "WORKER" as const;
  }
  if (name.includes("witness")) return "WITNESS" as const;
  if (mimeType.startsWith("image/")) return "PHOTO" as const;
  if (mimeType.startsWith("video/")) return "VIDEO" as const;
  return "OTHER" as const;
}

function validateText(value: string, label: string, minimum: number) {
  const trimmed = value.trim();

  if (trimmed.length < minimum) {
    throw new Error(`${label} must contain at least ${minimum} characters.`);
  }

  return trimmed;
}

export async function manuallyFileIncomingEmail(input: {
  communicationId: string;
  destinationClaimId: string;
  filedBy: string;
  reason: string;
}) {
  const filedBy = validateText(input.filedBy, "Filed by", 2);
  const reason = validateText(input.reason, "Reason", 5);

  const communication = await findCommunicationForManualFiling(
    input.communicationId,
  );

  if (!communication) {
    throw new Error("The email could not be found.");
  }

  if (communication.status !== "NEEDS_REVIEW" || communication.claimId) {
    throw new CommunicationAlreadyFiledError();
  }

  if (!communication.rawStorageKey) {
    throw new Error(
      "The original email file is unavailable, so its attachments cannot be safely filed.",
    );
  }

  const destinationClaim = await findClaimForManualFiling({
    claimId: input.destinationClaimId,
    organisationId: communication.organisationId,
  });

  if (!destinationClaim) {
    throw new Error("The selected claim could not be found.");
  }

  const rawSource = await documentStorage.read(communication.rawStorageKey);
  const mail = await simpleParser(rawSource);
  const stagedStorageKeys: string[] = [];
  const attachments: ManualFilingAttachmentRecord[] = [];
  const stagedHashes = new Set<string>();
  let skippedAttachmentCount = 0;

  try {
    for (const [index, attachment] of mail.attachments.entries()) {
      if (attachment.content.length === 0) {
        skippedAttachmentCount += 1;
        continue;
      }

      if (attachment.content.length > MAX_EMAIL_ATTACHMENT_BYTES) {
        skippedAttachmentCount += 1;
        continue;
      }

      const originalName =
        attachment.filename?.trim() || `email-attachment-${index + 1}`;
      const bytes = new Uint8Array(attachment.content);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (stagedHashes.has(sha256)) {
        skippedAttachmentCount += 1;
        continue;
      }

      const duplicate = await findDuplicateDocumentRecord({
        claimId: destinationClaim.id,
        sha256,
      });

      if (duplicate) {
        skippedAttachmentCount += 1;
        continue;
      }

      stagedHashes.add(sha256);

      const stored = await documentStorage.save({
        claimId: destinationClaim.id,
        originalName,
        bytes,
      });
      stagedStorageKeys.push(stored.storageKey);

      attachments.push({
        originalName,
        storageKey: stored.storageKey,
        mimeType: attachment.contentType || "application/octet-stream",
        sizeBytes: attachment.content.length,
        sha256,
        category: inferCategory(attachment),
      });
    }

    return await fileCommunicationToClaimRecord({
      communicationId: communication.id,
      organisationId: communication.organisationId,
      claimId: destinationClaim.id,
      filedBy,
      reason,
      attachments,
      skippedAttachmentCount,
    });
  } catch (error) {
    await Promise.allSettled(
      stagedStorageKeys.map((storageKey) => documentStorage.delete(storageKey)),
    );
    throw error;
  }
}
