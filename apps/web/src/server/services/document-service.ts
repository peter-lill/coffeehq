import { createHash } from "node:crypto";

import type { DocumentCategory } from "@prisma/client";

import { documentStorage } from "@/lib/storage/local-document-storage";
import { findClaimByNumber } from "@/server/repositories/claim-repository";
import {
  createDocumentAndEventRecord,
  findDocumentRecord,
  findDuplicateDocumentRecord,
  listDocumentRecords,
} from "@/server/repositories/document-repository";

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

export class DuplicateDocumentError extends Error {
  constructor(public readonly existingName: string) {
    super(`This file already exists on the claim as ${existingName}.`);
  }
}

function validateFile(file: File) {
  if (!file.name.trim()) throw new Error("The selected file has no filename.");
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_DOCUMENT_BYTES) throw new Error("Files must be 25 MB or smaller.");
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("This file type is not currently supported.");
  }
}

export async function getClaimDocuments(claimId: string) {
  return listDocumentRecords(claimId);
}

export async function getDocument(documentId: string) {
  return findDocumentRecord(documentId);
}

export async function readDocumentBytes(storageKey: string) {
  return documentStorage.read(storageKey);
}

export async function uploadClaimDocument(input: {
  claimNumber: string;
  file: File;
  category: DocumentCategory;
}) {
  validateFile(input.file);

  const claim = await findClaimByNumber(input.claimNumber);
  if (!claim) throw new Error("Claim not found.");

  const bytes = new Uint8Array(await input.file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const duplicate = await findDuplicateDocumentRecord({ claimId: claim.id, sha256 });

  if (duplicate) throw new DuplicateDocumentError(duplicate.originalName);

  const stored = await documentStorage.save({
    claimId: claim.id,
    originalName: input.file.name,
    bytes,
  });

  try {
    return await createDocumentAndEventRecord({
      claimId: claim.id,
      originalName: input.file.name,
      storageKey: stored.storageKey,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      sha256,
      source: "MANUAL_UPLOAD",
      category: input.category,
    });
  } catch (error) {
    await documentStorage.delete(stored.storageKey);
    throw error;
  }
}
