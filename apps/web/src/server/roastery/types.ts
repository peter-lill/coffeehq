export type ChatGptAuthor = {
  role?: string | null;
  name?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ChatGptMessage = {
  id?: string | null;
  author?: ChatGptAuthor | null;
  create_time?: number | null;
  update_time?: number | null;
  content?: {
    content_type?: string | null;
    parts?: unknown[] | null;
  } | null;
  metadata?: Record<string, unknown> | null;
};

export type ChatGptMappingNode = {
  id?: string | null;
  parent?: string | null;
  children?: string[] | null;
  message?: ChatGptMessage | null;
};

export type ChatGptConversation = {
  id?: string | null;
  conversation_id?: string | null;
  title?: string | null;
  create_time?: number | null;
  update_time?: number | null;
  current_node?: string | null;
  mapping?: Record<string, ChatGptMappingNode> | null;
};

export type ParsedMessage = {
  sourceMessageId: string;
  role: string;
  authorName: string | null;
  createdAt: Date | null;
  text: string;
};

export type ParsedConversation = {
  sourceConversationId: string;
  title: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: ParsedMessage[];
  participantNames: string[];
  detectedClaimNumbers: string[];
  searchText: string;
  raw: ChatGptConversation;
};
