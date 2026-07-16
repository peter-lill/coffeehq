import type {
  ClaimMatchMethod,
  CommunicationStatus,
} from "@prisma/client";

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
};
