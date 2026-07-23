"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { importApprovedBatch, reviewConversation } from "@/server/roastery/import-service";
import { stageConversationExportFromInbox } from "@/server/roastery/inbox-service";

export async function stageConversationExportAction(formData: FormData) {
  const filename = String(formData.get("filename") || "");
  if (!filename) throw new Error("Choose an archive from the import inbox.");
  const batch = await stageConversationExportFromInbox(filename);
  revalidatePath("/roastery");
  redirect(`/roastery/${batch.id}`);
}

export async function reviewConversationAction(formData: FormData) {
  const batchId = String(formData.get("batchId") || "");
  const conversationId = String(formData.get("conversationId") || "");
  const decision = String(formData.get("decision") || "") as "assign" | "exclude";
  const claimId = String(formData.get("claimId") || "") || undefined;
  const reviewNotes = String(formData.get("reviewNotes") || "") || undefined;
  await reviewConversation({ batchId, conversationId, decision, claimId, reviewNotes });
  revalidatePath(`/roastery/${batchId}`);
}

export async function importBatchAction(formData: FormData) {
  const batchId = String(formData.get("batchId") || "");
  await importApprovedBatch(batchId);
  revalidatePath(`/roastery/${batchId}`);
  revalidatePath("/roastery");
}
