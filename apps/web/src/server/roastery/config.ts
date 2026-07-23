export const ROASTERY_LIMITS = {
  maximumArchiveBytes: 1024 * 1024 * 1024, // 1 GB
  maximumEntries: 20_000,
  maximumSingleEntryBytes: 250 * 1024 * 1024,
  maximumTotalUncompressedBytes: 5 * 1024 * 1024 * 1024,
  maximumConversationJsonBytes: 512 * 1024 * 1024,
} as const;

export const REQUIRED_EXPORT_FILENAME = "conversations.json";
