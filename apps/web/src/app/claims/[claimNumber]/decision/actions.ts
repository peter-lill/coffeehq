"use server";

import { revalidatePath } from "next/cache";

import type { SubstantiationStatus } from "@/server/domain/decision/causative-factors";
import type {
  LegislativeAssessmentStatus,
  LegislativeElementKey,
} from "@/server/domain/decision/legislative-assessment";
import { recordCausativeFactorAssessment } from "@/server/services/causative-factor-assessment-service";
import { recordLegislativeAssessment } from "@/server/services/legislative-assessment-service";

export async function saveCausativeFactorAssessment(formData: FormData) {
  const claimNumber = String(formData.get("claimNumber") ?? "");
  const factorKey = String(formData.get("factorKey") ?? "");
  const status = String(formData.get("status") ?? "NOT_ASSESSED") as SubstantiationStatus;
  const reasons = String(formData.get("reasons") ?? "");
  const assessedBy = String(formData.get("assessedBy") ?? "");

  if (!claimNumber || !factorKey) throw new Error("Claim number and causative factor are required.");
  if (status !== "NOT_ASSESSED" && !reasons.trim()) {
    throw new Error("Reasons are required when recording a substantiation finding.");
  }

  await recordCausativeFactorAssessment({
    claimNumber,
    factorKey,
    status,
    reasons,
    assessedBy,
  });

  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/decision`);
}

export async function saveLegislativeAssessment(formData: FormData) {
  const claimNumber = String(formData.get("claimNumber") ?? "");
  const elementKey = String(formData.get("elementKey") ?? "") as LegislativeElementKey;
  const status = String(formData.get("status") ?? "NOT_ASSESSED") as LegislativeAssessmentStatus;
  const reasons = String(formData.get("reasons") ?? "");
  const evidenceSummary = String(formData.get("evidenceSummary") ?? "");
  const assessedBy = String(formData.get("assessedBy") ?? "");
  const linkedFactorKeys = formData.getAll("linkedFactorKeys").map(String);

  if (!claimNumber || !elementKey) throw new Error("Claim number and legislative element are required.");

  const requiresReasons = status === "SATISFIED" || status === "NOT_SATISFIED";
  if (requiresReasons && !reasons.trim()) {
    throw new Error("Reasons are required when recording a satisfied or not satisfied assessment.");
  }

  await recordLegislativeAssessment({
    claimNumber,
    elementKey,
    status,
    reasons,
    evidenceSummary,
    linkedFactorKeys,
    assessedBy,
  });

  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}/decision`);
}
