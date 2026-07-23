import path from "node:path";

import { ROASTERY_LIMITS } from "@/server/roastery/config";

export type ArchiveEntrySummary = {
  path: string;
  compressedSize: number;
  uncompressedSize: number;
  isDirectory: boolean;
};

export function normaliseArchivePath(entryPath: string): string {
  const slashPath = entryPath.replaceAll("\\", "/");
  const normalised = path.posix.normalize(slashPath);

  if (
    normalised.startsWith("/") ||
    normalised === ".." ||
    normalised.startsWith("../") ||
    /^[A-Za-z]:\//.test(normalised)
  ) {
    throw new Error(`Unsafe archive path: ${entryPath}`);
  }

  return normalised;
}

export function validateArchiveEntries(entries: ArchiveEntrySummary[]) {
  if (entries.length > ROASTERY_LIMITS.maximumEntries) {
    throw new Error("The export contains too many archive entries.");
  }

  let totalUncompressedBytes = 0;

  for (const entry of entries) {
    normaliseArchivePath(entry.path);

    if (entry.uncompressedSize > ROASTERY_LIMITS.maximumSingleEntryBytes) {
      throw new Error(`Archive entry is too large: ${entry.path}`);
    }

    totalUncompressedBytes += entry.uncompressedSize;

    if (
      totalUncompressedBytes >
      ROASTERY_LIMITS.maximumTotalUncompressedBytes
    ) {
      throw new Error("The export expands beyond the permitted size.");
    }
  }
}
