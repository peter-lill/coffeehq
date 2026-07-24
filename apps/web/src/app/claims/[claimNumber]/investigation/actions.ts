"use server";

import {
  DocumentCategory,
  EvidenceRequestedFromType,
  EvidenceRequirementStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createClaimEvidenceRequirement,
  updateClaimEvidenceRequirementStatus,
} from "@/server/services/evidence-requirement-service";

function optionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const date = new Date(`${value}T00:00:00+10:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date supplied.");
  return date;
}

export async function createEvidenceRequirementAction(
  claimNumber: string,
  formData: FormData,
) {
  const category = String(formData.get("category"));
  const requestedFromType = String(formData.get("requestedFromType") || "");

  if (!Object.values(DocumentCategory).includes(category as DocumentCategory)) {
    throw new Error("Invalid evidence category.");
  }

  if (
    requestedFromType &&
    !Object.values(EvidenceRequestedFromType).includes(
      requestedFromType as EvidenceRequestedFromType,
    )
  ) {
    throw new Error("Invalid requested-from type.");
  }

  await createClaimEvidenceRequirement({
    claimNumber,
    category: category as DocumentCategory,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    requestedFrom: String(formData.get("requestedFrom") || ""),
    requestedFromType: requestedFromType
      ? (requestedFromType as EvidenceRequestedFromType)
      : null,
    dueDate: optionalDate(formData.get("dueDate")),
    followUpDate: optionalDate(formData.get("followUpDate")),
    blockingDetermination: formData.get("blockingDetermination") === "on",
    createdByName: "Customer Advisor",
  });

  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function updateEvidenceRequirementStatusAction(
  claimNumber: string,
  requirementId: string,
  formData: FormData,
) {
  const status = String(formData.get("status"));
  if (!Object.values(EvidenceRequirementStatus).includes(status as EvidenceRequirementStatus)) {
    throw new Error("Invalid evidence requirement status.");
  }

  await updateClaimEvidenceRequirementStatus({
    id: requirementId,
    status: status as EvidenceRequirementStatus,
    updatedByName: "Customer Advisor",
  });

  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}
