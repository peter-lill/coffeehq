import { moveDocumentRecord } from "@/server/repositories/document-move-repository";

export type MoveDocumentInput = {
  documentId: string;
  sourceClaimId: string;
  destinationClaimId: string;
  reason: string;
  createdById?: string;
};

export async function moveDocument(input: MoveDocumentInput) {
  const reason = input.reason.trim();

  if (reason.length < 5) {
    throw new Error("Enter a clear reason for moving the document.");
  }

  return moveDocumentRecord({
    ...input,
    reason,
  });
}
