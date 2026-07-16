import type {
  CommunicationStatus,
  DocumentCategory,
  DocumentSource,
  EvidenceRequirementStatus,
} from "@prisma/client";

export const evidenceCategoryOrder: DocumentCategory[] = [
  "MEDICAL",
  "WORKER",
  "EMPLOYER",
  "WITNESS",
  "EMPLOYMENT",
  "PAYROLL",
  "COMMUNICATION",
  "PHOTO",
  "VIDEO",
  "OTHER",
];

export const evidenceCategoryLabels: Record<DocumentCategory, string> = {
  MEDICAL: "Medical evidence",
  EMPLOYMENT: "Employment records",
  WORKER: "Worker submissions",
  EMPLOYER: "Employer submissions",
  WITNESS: "Witness evidence",
  PAYROLL: "Payroll and rosters",
  COMMUNICATION: "Communications",
  PHOTO: "Photographs",
  VIDEO: "Video evidence",
  OTHER: "Other evidence",
};

export const evidenceStatusLabels: Record<EvidenceRequirementStatus, string> = {
  OUTSTANDING: "Outstanding",
  REQUESTED: "Requested",
  RECEIVED: "Received",
  NOT_REQUIRED: "Not required",
};

export type EvidenceDocumentItem = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  source: DocumentSource;
  category: DocumentCategory;
  createdAt: Date;
  communication: {
    id: string;
    subject: string;
    sender: string;
    receivedAt: Date;
  } | null;
};

export type EvidenceCommunicationItem = {
  id: string;
  subject: string;
  sender: string;
  receivedAt: Date;
  status: CommunicationStatus;
  attachmentCount: number;
};

export type EvidenceRequirementItem = {
  id: string;
  category: DocumentCategory;
  title: string;
  description: string | null;
  requestedFrom: string | null;
  dueDate: Date | null;
  status: EvidenceRequirementStatus;
  completedAt: Date | null;
  createdByName: string | null;
  updatedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EvidenceCategoryGroup = {
  category: DocumentCategory;
  label: string;
  documents: EvidenceDocumentItem[];
  communications: EvidenceCommunicationItem[];
  itemCount: number;
};

export type EvidenceRegister = {
  groups: EvidenceCategoryGroup[];
  requirements: EvidenceRequirementItem[];
  totals: {
    documents: number;
    communications: number;
    outstanding: number;
    requested: number;
    received: number;
  };
};

export type EvidenceDashboardItem = {
  claimId: string;
  claimNumber: string;
  claimantName: string;
  status: string;
  documentCount: number;
  communicationCount: number;
  outstandingCount: number;
  requestedCount: number;
};

export type EvidenceRequirementActionResult =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };
