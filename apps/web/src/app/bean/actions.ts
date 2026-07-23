"use server";

import { brewFileNote } from "@/server/bean/engine";

export async function brewFileNoteAction(source: string) {
  if (source.length > 2_000_000) throw new Error("Transcript is too large for paste mode. Use file import when enabled.");
  return brewFileNote(source);
}
