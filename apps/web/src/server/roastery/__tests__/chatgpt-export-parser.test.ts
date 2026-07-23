import { describe, expect, it } from "vitest";

import { parseChatGptExport } from "@/server/roastery/chatgpt-export-parser";

describe("parseChatGptExport", () => {
  it("extracts ordered messages and claim references", () => {
    const result = parseChatGptExport([
      {
        id: "conversation-1",
        title: "Jai Hood review",
        create_time: 1_700_000_000,
        mapping: {
          second: {
            id: "second",
            message: {
              id: "message-2",
              author: { role: "assistant" },
              create_time: 1_700_000_002,
              content: {
                parts: ["Review completed for S25EG365932."],
              },
            },
          },
          first: {
            id: "first",
            message: {
              id: "message-1",
              author: { role: "user", name: "Peter" },
              create_time: 1_700_000_001,
              content: {
                parts: ["Please review Jai Hood."],
              },
            },
          },
        },
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].messages.map((message) => message.sourceMessageId)).toEqual([
      "message-1",
      "message-2",
    ]);
    expect(result[0].detectedClaimNumbers).toEqual(["S25EG365932"]);
    expect(result[0].participantNames).toEqual(["Peter"]);
  });

  it("tolerates missing mappings", () => {
    const result = parseChatGptExport([{ id: "empty", title: "Empty" }]);
    expect(result[0].messages).toEqual([]);
  });

  it("rejects a non-array export", () => {
    expect(() => parseChatGptExport({})).toThrow(
      "conversations.json does not contain an array.",
    );
  });
});
