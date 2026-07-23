import { db } from "@/lib/db";
import { requireClaimAccess } from "@/server/access/claim-access-service";
import { requireCurrentUser } from "@/server/auth/current-user";
import { evaluateQualificationDates } from "./rules";

function dateOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? new Date(`${text}T12:00:00`) : null;
}

export async function getQualification(claimId: string) {
  await requireClaimAccess(claimId);
  const record = await db.claimQualification.findUnique({ where: { claimId } });
  return { record, alerts: evaluateQualificationDates(record ?? {}) };
}

export async function saveQualification(claimId: string, formData: FormData) {
  await requireClaimAccess(claimId);
  const user = await requireCurrentUser();
  const data = {
    consentProvided: formData.get("consentProvided") === "on",
    privacyAgreed: formData.get("privacyAgreed") === "on",
    medicalCertificate: formData.get("medicalCertificate") === "on",
    injuryDate: dateOrNull(formData.get("injuryDate")),
    dateFirstSeen: dateOrNull(formData.get("dateFirstSeen")),
    certificateIssueDate: dateOrNull(formData.get("certificateIssueDate")),
    claimLodgementDate: dateOrNull(formData.get("claimLodgementDate")),
    diagnosis: String(formData.get("diagnosis") ?? "").trim() || null,
    capacity: String(formData.get("capacity") ?? "").trim() || null,
    treatingPractitioner: String(formData.get("treatingPractitioner") ?? "").trim() || null,
    medicalFactors: String(formData.get("medicalFactors") ?? "").trim() || null,
    firstSeenConsideration: String(formData.get("firstSeenConsideration") ?? "").trim() || null,
    issueDateConsideration: String(formData.get("issueDateConsideration") ?? "").trim() || null,
    sixMonthConsideration: String(formData.get("sixMonthConsideration") ?? "").trim() || null,
  };
  const valid = data.consentProvided && data.privacyAgreed && data.medicalCertificate;
  return db.claimQualification.upsert({
    where: { claimId },
    create: { claimId, ...data, completedByName: valid ? user.name : null, completedAt: valid ? new Date() : null },
    update: { ...data, completedByName: valid ? user.name : null, completedAt: valid ? new Date() : null },
  });
}
