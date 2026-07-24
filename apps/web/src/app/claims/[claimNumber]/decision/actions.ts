"use server";

import { revalidatePath } from "next/cache";

import type { SubstantiationStatus } from "@/server/domain/decision/causative-factors";
import { recordCausativeFactorAssessment } from "@/server/services/causative-factor-assessment-service";

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
