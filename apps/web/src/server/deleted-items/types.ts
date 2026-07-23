export type DeletableItemType =
  | "CLAIM"
  | "DOCUMENT"
  | "COMMUNICATION"
  | "EVIDENCE_REQUIREMENT";

export type DeletedItem = {
  id: string;
  type: DeletableItemType;
  title: string;
  detail: string;
  claimNumber: string | null;
  claimantName: string | null;
  deletedAt: Date;
  deletedByName: string | null;
  deletionReason: string | null;
};
