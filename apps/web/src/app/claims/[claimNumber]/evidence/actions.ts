"use server";

import type {
  DocumentCategory,
  EvidenceRequirementStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { EvidenceRequirementActionResult } from "@/server/evidence/types";
import { getClaim } from "@/server/services/claim-service";
import {
  addEvidenceRequirement,
  changeEvidenceRequirementStatus,
} from "@/server/services/evidence-service";

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

const statuses = new Set<EvidenceRequirementStatus>([
  "OUTSTANDING",
  "REQUESTED",
  "RECEIVED",
  "NOT_REQUIRED",
]);

function operatorName() {
  return process.env.COFFEEHQ_OPERATOR_NAME?.trim() || undefined;
}

function parseDueDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(`${value}T00:00:00+10:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid due date.");
  }
  return date;
}

export async function createEvidenceRequirementAction(
  claimNumber: string,
  _previousState: EvidenceRequirementActionResult,
  formData: FormData,
): Promise<EvidenceRequirementActionResult> {
  try {
    const claim = await getClaim(claimNumber);
    if (!claim) throw new Error("Claim not found.");

    const categoryValue = formData.get("category");
    const category =
      typeof categoryValue === "string" &&
      categories.has(categoryValue as DocumentCategory)
        ? (categoryValue as DocumentCategory)
        : null;

    if (!category) throw new Error("Select an evidence category.");

    await addEvidenceRequirement({
      claimId: claim.id,
      category,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      requestedFrom: String(formData.get("requestedFrom") ?? ""),
      dueDate: parseDueDate(formData.get("dueDate")),
      operatorName: operatorName(),
    });

    revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/evidence`);
    revalidatePath("/evidence");
    revalidatePath(`/claims/${encodeURIComponent(claimNumber)}`);

    return {
      status: "success",
      message: "Evidence requirement added.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The evidence requirement could not be added.",
    };
  }
}

export async function updateEvidenceRequirementStatusAction(
  claimNumber: string,
  requirementId: string,
  formData: FormData,
): Promise<void> {
  const claim = await getClaim(claimNumber);
  if (!claim) throw new Error("Claim not found.");

  const statusValue = formData.get("status");
  if (
    typeof statusValue !== "string" ||
    !statuses.has(statusValue as EvidenceRequirementStatus)
  ) {
    throw new Error("Select a valid evidence status.");
  }

  await changeEvidenceRequirementStatus({
    claimId: claim.id,
    requirementId,
    status: statusValue as EvidenceRequirementStatus,
    operatorName: operatorName(),
  });

  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/evidence`);
  revalidatePath("/evidence");
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}`);
}
