import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { createImportBatch } from "@/server/roastery/import-service";

const DEFAULT_IMPORT_DIR = path.resolve(process.cwd(), "../../imports/chatgpt");

function importDirectory() {
  return path.resolve(process.env.COFFEEHQ_CHATGPT_IMPORT_DIR || DEFAULT_IMPORT_DIR);
}

function safeArchiveName(value: string) {
  const filename = path.basename(value);
  if (!filename || filename !== value || !filename.toLowerCase().endsWith(".zip")) {
    throw new Error("Select a valid ZIP from the import inbox.");
  }
  return filename;
}

async function resolveArchive(filename: string) {
  const directory = importDirectory();
  const safeName = safeArchiveName(filename);
  const candidate = path.resolve(directory, safeName);
  const relative = path.relative(directory, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("The selected archive is outside the import inbox.");
  }
  const stat = await fs.stat(candidate);
  if (!stat.isFile()) throw new Error("The selected archive is not a file.");
  return { path: candidate, filename: safeName, stat };
}

export type InboxArchive = { filename: string; sizeBytes: number; modifiedAt: Date };

export async function listConversationExportInbox(): Promise<InboxArchive[]> {
  const directory = importDirectory();
  await fs.mkdir(directory, { recursive: true });
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const archives: InboxArchive[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".zip")) continue;
    const stat = await fs.stat(path.join(directory, entry.name));
    archives.push({ filename: entry.name, sizeBytes: stat.size, modifiedAt: stat.mtime });
  }
  return archives.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}

export async function stageConversationExportFromInbox(filename: string) {
  const archive = await resolveArchive(filename);
  const bytes = await fs.readFile(archive.path);
  const file = new File([bytes], archive.filename, {
    type: "application/zip",
    lastModified: archive.stat.mtimeMs,
  });
  return createImportBatch(file);
}
