"use server";

import { revalidatePath } from "next/cache";

import type {
  EvidenceClassificationActionResult,
  ManualFileCommunicationResult,
} from "@/server/communications/types";
import { classifyIncomingEmailEvidence } from "@/server/services/email-evidence-classification-service";
import { syncIncomingClaimsMailbox } from "@/server/services/mail-sync-service";
import { manuallyFileIncomingEmail } from "@/server/services/manual-email-filing-service";

export type SyncMailboxState =
  | { status: "idle"; message?: undefined }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function syncMailboxAction(
  _previousState: SyncMailboxState,
): Promise<SyncMailboxState> {
  try {
    const result = await syncIncomingClaimsMailbox();
    revalidatePath("/inbox");
    return {
      status: "success",
      message: `Checked ${result.found} message(s): ${result.filed} filed, ${result.needsReview} requiring review, ${result.duplicates} duplicate(s), ${result.failed} failed.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Mailbox sync failed.",
    };
  }
}

export async function classifyCommunicationEvidenceAction(
  communicationId: string,
  _previousState: EvidenceClassificationActionResult,
  formData: FormData,
): Promise<EvidenceClassificationActionResult> {
  try {
    await classifyIncomingEmailEvidence({
      communicationId,
      category: String(formData.get("category") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      relevance: String(formData.get("relevance") ?? ""),
      reviewedByName: String(formData.get("reviewedByName") ?? ""),
      requirementId: String(formData.get("requirementId") ?? ""),
      applyCategoryToAttachments:
        formData.get("applyCategoryToAttachments") === "on",
    });
    revalidatePath("/inbox");
    revalidatePath(`/inbox/${communicationId}`);
    return { status: "success", message: "Evidence details saved." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Evidence details could not be saved.",
    };
  }
}

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
    revalidatePath(`/claims/${encodeURIComponent(result.claim.claimNumber)}`);

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
