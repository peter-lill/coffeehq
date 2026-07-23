"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { closeClaim, reopenClaim } from "@/server/services/claim-service";
import { softDeleteItem } from "@/server/services/deleted-items-service";

function revalidateClaim(claimNumber: string) {
  revalidatePath("/");
  revalidatePath("/claims");
  revalidatePath("/evidence");
  revalidatePath(`/claims/${encodeURIComponent(claimNumber)}`);
}

export async function closeClaimAction(
  claimNumber: string,
  formData: FormData,
) {
  const outcome = String(formData.get("outcome") ?? "");
  if (outcome !== "ACCEPTED" && outcome !== "REJECTED") {
    throw new Error("Select accepted or rejected.");
  }

  await closeClaim({ claimNumber, outcome });
  revalidateClaim(claimNumber);
  redirect("/claims?view=inactive");
}

export async function reopenClaimAction(claimNumber: string) {
  await reopenClaim(claimNumber);
  revalidateClaim(claimNumber);
  redirect(`/claims/${encodeURIComponent(claimNumber)}`);
}

export async function deleteClaimAction(
  claimId: string,
  formData: FormData,
) {
  await softDeleteItem({
    type: "CLAIM",
    id: claimId,
    reason: String(formData.get("reason") ?? ""),
  });
  revalidatePath("/");
  revalidatePath("/claims");
  revalidatePath("/deleted-items");
  redirect("/claims");
}
