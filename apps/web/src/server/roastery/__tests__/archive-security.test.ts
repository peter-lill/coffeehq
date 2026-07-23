import { describe, expect, it } from "vitest";

import {
  normaliseArchivePath,
  validateArchiveEntries,
} from "@/server/roastery/archive-security";

describe("archive security", () => {
  it("normalises a safe nested path", () => {
    expect(normaliseArchivePath("export/conversations.json")).toBe(
      "export/conversations.json",
    );
  });

  it("rejects parent traversal", () => {
    expect(() => normaliseArchivePath("../schema.prisma")).toThrow(
      "Unsafe archive path",
    );
  });

  it("rejects Windows absolute paths", () => {
    expect(() => normaliseArchivePath("C:\\temp\\file.txt")).toThrow(
      "Unsafe archive path",
    );
  });

  it("accepts a small archive manifest", () => {
    expect(() =>
      validateArchiveEntries([
        {
          path: "conversations.json",
          compressedSize: 100,
          uncompressedSize: 200,
          isDirectory: false,
        },
      ]),
    ).not.toThrow();
  });
});
