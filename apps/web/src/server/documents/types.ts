import type { DocumentCategory, DocumentSource } from "@prisma/client";

export type DocumentListItem = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  source: DocumentSource;
  category: DocumentCategory;
  createdAt: Date;
};

export type UploadDocumentResult =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type MoveDocumentResult =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string };
