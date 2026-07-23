"use server";

import { revalidatePath } from "next/cache";

import type { DeletableItemType } from "@/server/deleted-items/types";
import {
  permanentlyDeleteItem,
  restoreDeletedItem,
  softDeleteItem,
} from "@/server/services/deleted-items-service";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/claims");
  revalidatePath("/inbox");
  revalidatePath("/evidence");
  revalidatePath("/deleted-items");
}

export async function softDeleteItemAction(
  type: DeletableItemType,
  id: string,
  formData: FormData,
) {
  await softDeleteItem({
    type,
    id,
    reason: String(formData.get("reason") ?? ""),
  });
  revalidateAll();
}

export async function restoreDeletedItemAction(
  type: DeletableItemType,
  id: string,
) {
  await restoreDeletedItem({ type, id });
  revalidateAll();
}

export async function permanentlyDeleteItemAction(
  type: DeletableItemType,
  id: string,
  formData: FormData,
) {
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    throw new Error('Type DELETE to permanently remove the item.');
  }
  await permanentlyDeleteItem({ type, id });
  revalidateAll();
}
