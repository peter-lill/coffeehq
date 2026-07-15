"use server";

import type { DocumentCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  MoveDocumentResult,
  UploadDocumentResult,
} from "@/server/documents/types";
import { moveDocument } from "@/server/services/document-move-service";
import {
  DuplicateDocumentError,
  uploadClaimDocument,
} from "@/server/services/document-service";

const categories = new Set<DocumentCategory>([
  "MEDICAL",
  "EMPLOYMENT",
  "WORKER",
  "EMPLOYER",
  "WITNESS",
  "PAYROLL",
  "COMMUNICATION",
  "PHOTO",
  "VIDEO",
  "OTHER",
]);

export async function uploadDocumentAction(
  claimNumber: string,
  _previousState: UploadDocumentResult,
  formData: FormData,
): Promise<UploadDocumentResult> {
  const file = formData.get("file");
  const rawCategory = formData.get("category");

  if (!(file instanceof File)) {
    return {
      status: "error",
      message: "Select a file to upload.",
    };
  }

  const category =
    typeof rawCategory === "string" &&
    categories.has(rawCategory as DocumentCategory)
      ? (rawCategory as DocumentCategory)
      : "OTHER";

  try {
    await uploadClaimDocument({
      claimNumber,
      file,
      category,
    });

    revalidatePath(`/claims/${encodeURIComponent(claimNumber)}`);

    return {
      status: "success",
      message: `${file.name} was added to the claim.`,
    };
  } catch (error) {
    if (error instanceof DuplicateDocumentError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    console.error("Document upload failed", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The document could not be uploaded.",
    };
  }
}

export async function moveDocumentAction(
  documentId: string,
  sourceClaimId: string,
  sourceClaimNumber: string,
  _previousState: MoveDocumentResult,
  formData: FormData,
): Promise<MoveDocumentResult> {
  const destinationClaimId = formData.get("destinationClaimId");
  const reason = formData.get("reason");

  if (
    typeof destinationClaimId !== "string" ||
    destinationClaimId.length === 0
  ) {
    return {
      status: "error",
      message: "Select the claim the document should be moved to.",
    };
  }

  if (typeof reason !== "string" || reason.trim().length < 5) {
    return {
      status: "error",
      message: "Enter a clear reason for moving the document.",
    };
  }

  try {
    const result = await moveDocument({
      documentId,
      sourceClaimId,
      destinationClaimId,
      reason,
    });

    revalidatePath(
      `/claims/${encodeURIComponent(sourceClaimNumber)}`,
    );

    revalidatePath(
      `/claims/${encodeURIComponent(
        result.destinationClaim.claimNumber,
      )}`,
    );

    redirect(
      `/claims/${encodeURIComponent(
        result.destinationClaim.claimNumber,
      )}`,
    );
  } catch (error) {
    console.error("Document move failed", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The document could not be moved.",
    };
  }
}
