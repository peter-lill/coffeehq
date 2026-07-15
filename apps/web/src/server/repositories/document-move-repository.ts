import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type MoveDocumentRecordInput = {
  documentId: string;
  sourceClaimId: string;
  destinationClaimId: string;
  reason: string;
  createdById?: string;
};

export async function moveDocumentRecord({
  documentId,
  sourceClaimId,
  destinationClaimId,
  reason,
  createdById,
}: MoveDocumentRecordInput) {
  return db.$transaction(
    async (transaction) => {
      const document = await transaction.document.findFirst({
        where: {
          id: documentId,
          claimId: sourceClaimId,
        },
        include: {
          claim: {
            select: {
              id: true,
              organisationId: true,
              claimNumber: true,
              claimantName: true,
            },
          },
        },
      });

      if (!document) {
        throw new Error("Document was not found on the source claim.");
      }

      if (sourceClaimId === destinationClaimId) {
        throw new Error("The destination must be a different claim.");
      }

      const destinationClaim = await transaction.claim.findFirst({
        where: {
          id: destinationClaimId,
          organisationId: document.claim.organisationId,
        },
        select: {
          id: true,
          claimNumber: true,
          claimantName: true,
        },
      });

      if (!destinationClaim) {
        throw new Error(
          "Destination claim was not found in the same organisation.",
        );
      }

      const duplicate = await transaction.document.findFirst({
        where: {
          claimId: destinationClaimId,
          sha256: document.sha256,
        },
        select: {
          id: true,
          originalName: true,
        },
      });

      if (duplicate) {
        throw new Error(
          `The destination claim already contains an identical file: ${duplicate.originalName}`,
        );
      }

      const movedAt = new Date();

      const movedOutEvent = await transaction.claimEvent.create({
        data: {
          claimId: sourceClaimId,
          createdById,
          type: "DOCUMENT_MOVED_OUT",
          title: "Document moved to another claim",
          description:
            `${document.originalName} was moved to ` +
            `${destinationClaim.claimNumber} — ${destinationClaim.claimantName}. ` +
            `Reason: ${reason}`,
          occurredAt: movedAt,
          metadata: {
            documentId: document.id,
            storageKey: document.storageKey,
            destinationClaimId,
            destinationClaimNumber: destinationClaim.claimNumber,
            reason,
          } satisfies Prisma.InputJsonValue,
        },
      });

      const movedInEvent = await transaction.claimEvent.create({
        data: {
          claimId: destinationClaimId,
          createdById,
          type: "DOCUMENT_MOVED_IN",
          title: "Document moved from another claim",
          description:
            `${document.originalName} was moved from ` +
            `${document.claim.claimNumber} — ${document.claim.claimantName}. ` +
            `Reason: ${reason}`,
          occurredAt: movedAt,
          metadata: {
            documentId: document.id,
            storageKey: document.storageKey,
            sourceClaimId,
            sourceClaimNumber: document.claim.claimNumber,
            reason,
          } satisfies Prisma.InputJsonValue,
        },
      });

      const movedDocument = await transaction.document.update({
        where: {
          id: document.id,
        },
        data: {
          claimId: destinationClaimId,
          eventId: movedInEvent.id,
        },
      });

      return {
        document: movedDocument,
        sourceEvent: movedOutEvent,
        destinationEvent: movedInEvent,
        sourceClaim: document.claim,
        destinationClaim,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
