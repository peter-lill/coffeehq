"use server";

import {
  DocumentCategory,
  EvidenceRequestedFromType,
  EvidenceRequirementStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  CONFLICT_STATUSES,
  createConflictRecord,
  type ConflictStatus,
  updateConflictRecord,
} from "@/server/services/conflict-workspace-service";
import {
  createClaimEvidenceRequirement,
  updateClaimEvidenceRequirementStatus,
} from "@/server/services/evidence-requirement-service";
import {
  createMedicalWorkspaceRecord,
  MEDICAL_RECORD_STATUSES,
  PRACTITIONER_TYPES,
  type MedicalRecordStatus,
  type PractitionerType,
  updateMedicalWorkspaceRecord,
} from "@/server/services/medical-workspace-service";
import {
  createProceduralFairnessWorkflow,
  PROCEDURAL_FAIRNESS_STATUSES,
  type ProceduralFairnessRecipient,
  type ProceduralFairnessStatus,
  updateProceduralFairnessWorkflow,
} from "@/server/services/procedural-fairness-service";

function optionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const date = new Date(`${value}T00:00:00+10:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date supplied.");
  return date;
}

function lines(value: FormDataEntryValue | null) {
  return String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);
}

export async function createEvidenceRequirementAction(claimNumber: string, formData: FormData) {
  const category = String(formData.get("category"));
  const requestedFromType = String(formData.get("requestedFromType") || "");

  if (!Object.values(DocumentCategory).includes(category as DocumentCategory)) throw new Error("Invalid evidence category.");
  if (requestedFromType && !Object.values(EvidenceRequestedFromType).includes(requestedFromType as EvidenceRequestedFromType)) {
    throw new Error("Invalid requested-from type.");
  }

  await createClaimEvidenceRequirement({
    claimNumber,
    category: category as DocumentCategory,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    requestedFrom: String(formData.get("requestedFrom") || ""),
    requestedFromType: requestedFromType ? requestedFromType as EvidenceRequestedFromType : null,
    dueDate: optionalDate(formData.get("dueDate")),
    followUpDate: optionalDate(formData.get("followUpDate")),
    blockingDetermination: formData.get("blockingDetermination") === "on",
    createdByName: "CoffeeHQ user",
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function updateEvidenceRequirementStatusAction(claimNumber: string, requirementId: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!Object.values(EvidenceRequirementStatus).includes(status as EvidenceRequirementStatus)) throw new Error("Invalid evidence requirement status.");
  await updateClaimEvidenceRequirementStatus({ id: requirementId, status: status as EvidenceRequirementStatus, updatedByName: "CoffeeHQ user" });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function createProceduralFairnessAction(claimNumber: string, formData: FormData) {
  const recipientType = String(formData.get("recipientType"));
  if (!["WORKER", "EMPLOYER", "OTHER"].includes(recipientType)) throw new Error("Invalid procedural fairness recipient.");
  await createProceduralFairnessWorkflow({
    claimNumber,
    recipientType: recipientType as ProceduralFairnessRecipient,
    recipientName: String(formData.get("recipientName") || ""),
    summary: String(formData.get("summary") || ""),
    issues: lines(formData.get("issues")),
    dueDate: optionalDate(formData.get("dueDate")),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function updateProceduralFairnessAction(claimNumber: string, workflowId: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!PROCEDURAL_FAIRNESS_STATUSES.includes(status as ProceduralFairnessStatus)) throw new Error("Invalid procedural fairness status.");
  await updateProceduralFairnessWorkflow({
    claimNumber,
    workflowId,
    status: status as ProceduralFairnessStatus,
    issuedAt: optionalDate(formData.get("issuedAt")),
    dueDate: optionalDate(formData.get("dueDate")),
    extensionDate: optionalDate(formData.get("extensionDate")),
    responseReceivedAt: optionalDate(formData.get("responseReceivedAt")),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function createConflictAction(claimNumber: string, formData: FormData) {
  await createConflictRecord({
    claimNumber,
    issue: String(formData.get("issue") || ""),
    causativeFactor: String(formData.get("causativeFactor") || ""),
    workerPosition: String(formData.get("workerPosition") || ""),
    employerPosition: String(formData.get("employerPosition") || ""),
    witnessEvidence: String(formData.get("witnessEvidence") || ""),
    objectiveEvidence: String(formData.get("objectiveEvidence") || ""),
    outstandingEvidence: lines(formData.get("outstandingEvidence")),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function updateConflictAction(claimNumber: string, conflictId: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!CONFLICT_STATUSES.includes(status as ConflictStatus)) throw new Error("Invalid conflict status.");
  await updateConflictRecord({
    claimNumber,
    conflictId,
    status: status as ConflictStatus,
    workerPosition: String(formData.get("workerPosition") || ""),
    employerPosition: String(formData.get("employerPosition") || ""),
    witnessEvidence: String(formData.get("witnessEvidence") || ""),
    objectiveEvidence: String(formData.get("objectiveEvidence") || ""),
    outstandingEvidence: lines(formData.get("outstandingEvidence")),
    finding: String(formData.get("finding") || ""),
    decisionRelevance: String(formData.get("decisionRelevance") || ""),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function createMedicalRecordAction(claimNumber: string, formData: FormData) {
  const practitionerType = String(formData.get("practitionerType"));
  if (!PRACTITIONER_TYPES.includes(practitionerType as PractitionerType)) throw new Error("Invalid practitioner type.");
  await createMedicalWorkspaceRecord({
    claimNumber,
    practitionerType: practitionerType as PractitionerType,
    practitionerName: String(formData.get("practitionerName") || ""),
    reportDate: optionalDate(formData.get("reportDate")),
    diagnosis: String(formData.get("diagnosis") || ""),
    capacity: String(formData.get("capacity") || ""),
    causativeFactors: lines(formData.get("causativeFactors")),
    workContributionOpinion: String(formData.get("workContributionOpinion") || ""),
    treatment: String(formData.get("treatment") || ""),
    restrictions: String(formData.get("restrictions") || ""),
    clarificationQuestions: lines(formData.get("clarificationQuestions")),
    notes: String(formData.get("notes") || ""),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}

export async function updateMedicalRecordAction(claimNumber: string, recordId: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!MEDICAL_RECORD_STATUSES.includes(status as MedicalRecordStatus)) throw new Error("Invalid medical record status.");
  await updateMedicalWorkspaceRecord({
    claimNumber,
    recordId,
    status: status as MedicalRecordStatus,
    causativeFactors: lines(formData.get("causativeFactors")),
    workContributionOpinion: String(formData.get("workContributionOpinion") || ""),
    clarificationQuestions: lines(formData.get("clarificationQuestions")),
    notes: String(formData.get("notes") || ""),
  });
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/investigation`);
}
