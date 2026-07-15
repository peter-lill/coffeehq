"use server";

import { ClaimStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addClaim } from "@/server/services/claim-service";

export type CreateClaimState = {
  error?: string;
};

export async function createClaimAction(
  _previousState: CreateClaimState,
  formData: FormData,
): Promise<CreateClaimState> {
  const claimNumber = String(formData.get("claimNumber") ?? "").trim();
  const claimantName = String(formData.get("claimantName") ?? "").trim();
  const injury = String(formData.get("injury") ?? "").trim();
  const nextAction = String(formData.get("nextAction") ?? "").trim();
  const status = String(formData.get("status") ?? ClaimStatus.OPEN);

  if (!claimNumber || !claimantName || !injury || !nextAction) {
    return { error: "Complete all required fields." };
  }

  if (!Object.values(ClaimStatus).includes(status as ClaimStatus)) {
    return { error: "Select a valid claim status." };
  }

  try {
    const claim = await addClaim({
      claimNumber,
      claimantName,
      injury,
      nextAction,
      status,
    });

    revalidatePath("/");
    revalidatePath("/claims");
    redirect(`/claims/${encodeURIComponent(claim.claimNumber)}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That claim number already exists." };
    }

    throw error;
  }
}
