import type {
  ChatGptConversation,
  ChatGptMessage,
  ParsedConversation,
  ParsedMessage,
} from "@/server/roastery/types";

const CLAIM_NUMBER_PATTERN = /\b[A-Z]\d{2}[A-Z]{2}\d{6}\b/g;

function unixSecondsToDate(value: number | null | undefined): Date | null {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value * 1000);
}

function partToText(part: unknown): string {
  if (typeof part === "string") return part;

  if (
    part &&
    typeof part === "object" &&
    "text" in part &&
    typeof (part as { text?: unknown }).text === "string"
  ) {
    return (part as { text: string }).text;
  }

  return "";
}

function messageText(message: ChatGptMessage): string {
  const parts = message.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map(partToText)
    .filter(Boolean)
    .join("\n")
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function parseChatGptConversation(
  conversation: ChatGptConversation,
  fallbackIndex: number,
): ParsedConversation {
  const mapping = conversation.mapping ?? {};
  const messages: ParsedMessage[] = [];

  for (const [nodeId, node] of Object.entries(mapping)) {
    const message = node?.message;
    if (!message) continue;

    const text = messageText(message);
    if (!text) continue;

    messages.push({
      sourceMessageId: message.id ?? node.id ?? nodeId,
      role: message.author?.role ?? "unknown",
      authorName: message.author?.name ?? null,
      createdAt: unixSecondsToDate(message.create_time),
      text,
    });
  }

  messages.sort((a, b) => {
    const left = a.createdAt?.getTime() ?? 0;
    const right = b.createdAt?.getTime() ?? 0;
    return left - right;
  });

  const participantNames = unique(
    messages
      .map((message) => message.authorName ?? "")
      .filter((name) => name.trim().length > 0),
  );

  const title = conversation.title?.trim() || null;
  const searchText = [title ?? "", ...messages.map((message) => message.text)]
    .join("\n")
    .trim();

  const detectedClaimNumbers = unique(
    (searchText.toUpperCase().match(CLAIM_NUMBER_PATTERN) ?? []).map(String),
  );

  return {
    sourceConversationId:
      conversation.id ??
      conversation.conversation_id ??
      `conversation-${fallbackIndex}`,
    title,
    createdAt: unixSecondsToDate(conversation.create_time),
    updatedAt: unixSecondsToDate(conversation.update_time),
    messages,
    participantNames,
    detectedClaimNumbers,
    searchText,
    raw: conversation,
  };
}

export function parseChatGptExport(input: unknown): ParsedConversation[] {
  if (!Array.isArray(input)) {
    throw new Error("conversations.json does not contain an array.");
  }

  return input.map((conversation, index) =>
    parseChatGptConversation(
      (conversation ?? {}) as ChatGptConversation,
      index,
    ),
  );
}
