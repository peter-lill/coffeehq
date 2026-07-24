import type {
  ClaimMatchMethod,
  CommunicationStatus,
  DocumentCategory,
} from "@prisma/client";

export type InboxStatusFilter = "ALL" | CommunicationStatus;

export type InboxQuery = {
  status?: InboxStatusFilter;
  search?: string;
};

export type InboxCounts = {
  all: number;
  needsReview: number;
  filed: number;
  failed: number;
  quarantined: number;
};

export type InboxCommunication = {
  id: string;
  claimNumber: string | null;
  claimantName: string | null;
  sender: string;
  subject: string;
  status: CommunicationStatus;
  matchMethod: ClaimMatchMethod;
  matchConfidence: number;
  receivedAt: Date;
  attachmentCount: number;
  manuallyFiledAt: Date | null;
  manuallyFiledBy: string | null;
  manualFilingReason: string | null;
};

export type CommunicationAttachment = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: DocumentCategory;
};

export type CommunicationDetail = InboxCommunication & {
  recipients: string[];
  ccRecipients: string[];
  bodyText: string;
  internetMessageId: string | null;
  rawAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments: CommunicationAttachment[];
};

export type EvidenceRequirementOption = {
  id: string;
  title: string;
};

export type EvidenceClassificationActionResult =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type ManualFileCommunicationResult =
  | { status: "idle"; message: ""; claimNumber: null }
  | { status: "success"; message: string; claimNumber: string }
  | { status: "error"; message: string; claimNumber: null };
