import type { DocumentCategory, DocumentSource } from "@prisma/client";

import { db } from "@/lib/db";

export async function listDocumentRecords(claimId: string) {
  return db.document.findMany({
    where: { claimId },
    orderBy: [{ createdAt: "desc" }, { originalName: "asc" }],
  });
}

export async function findDocumentRecord(documentId: string) {
  return db.document.findUnique({
    where: { id: documentId },
    include: {
      claim: {
        select: {
          id: true,
          claimNumber: true,
        },
      },
    },
  });
}

export async function findDuplicateDocumentRecord(input: {
  claimId: string;
  sha256: string;
}) {
  return db.document.findUnique({
    where: {
      claimId_sha256: input,
    },
  });
}

export async function createDocumentAndEventRecord(input: {
  claimId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  source: DocumentSource;
  category: DocumentCategory;
}) {
  return db.$transaction(async (transaction) => {
    const event = await transaction.claimEvent.create({
      data: {
        claimId: input.claimId,
        type: "DOCUMENT_UPLOADED",
        title: "Document uploaded",
        description: input.originalName,
        metadata: {
          originalName: input.originalName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          source: input.source,
          category: input.category,
        },
      },
    });

    return transaction.document.create({
      data: {
        claimId: input.claimId,
        eventId: event.id,
        originalName: input.originalName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        sha256: input.sha256,
        source: input.source,
        category: input.category,
      },
    });
  });
}
