"use server";
import { revalidatePath } from "next/cache";
import { saveQualification } from "@/server/qualification/qualification-service";
export async function saveQualificationAction(claimId: string, claimNumber: string, formData: FormData) {
  await saveQualification(claimId, formData);
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}`);
}
