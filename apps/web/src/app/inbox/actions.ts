"use server";

import { revalidatePath } from "next/cache";

import type { ManualFileCommunicationResult } from "@/server/communications/types";
import { manuallyFileIncomingEmail } from "@/server/services/manual-email-filing-service";

export async function fileCommunicationAction(
  communicationId: string,
  _previousState: ManualFileCommunicationResult,
  formData: FormData,
): Promise<ManualFileCommunicationResult> {
  const destinationClaimId = String(formData.get("destinationClaimId") ?? "").trim();
  const filedBy = String(formData.get("filedBy") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!destinationClaimId) {
    return {
      status: "error",
      message: "Select the claim this email belongs to.",
      claimNumber: null,
    };
  }

  try {
    const result = await manuallyFileIncomingEmail({
      communicationId,
      destinationClaimId,
      filedBy,
      reason,
    });

    revalidatePath("/inbox");
    revalidatePath(
      `/claims/${encodeURIComponent(result.claim.claimNumber)}`,
    );

    const attachmentMessage =
      result.attachmentCount === 1
        ? "1 attachment was filed"
        : `${result.attachmentCount} attachments were filed`;
    const skippedMessage =
      result.skippedAttachmentCount > 0
        ? ` ${result.skippedAttachmentCount} duplicate, empty or oversized attachment(s) were skipped.`
        : "";

    return {
      status: "success",
      message: `Email filed to ${result.claim.claimNumber}. ${attachmentMessage}.${skippedMessage}`,
      claimNumber: result.claim.claimNumber,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The email could not be filed. Please try again.",
      claimNumber: null,
    };
  }
}
