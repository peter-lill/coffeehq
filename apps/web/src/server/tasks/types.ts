export type WorkQueuePriority =
  "OVERDUE" | "DUE_TODAY" | "READY" | "UPCOMING" | "WAITING";

export type WorkQueueSource = "CLAIM" | "EVIDENCE";

export type WorkQueueItem = {
  id: string;
  source: WorkQueueSource;
  priority: WorkQueuePriority;
  claimId: string;
  claimNumber: string;
  claimantName: string;
  claimStatus: string;
  title: string;
  description: string | null;
  category: string | null;
  assignedOwner: string | null;
  dueDate: Date | null;
  followUpDate: Date | null;
  blockingDetermination: boolean;
  determinationReadiness: number;
  href: string;
};

export type WorkQueueSummary = {
  overdue: number;
  dueToday: number;
  ready: number;
  upcoming: number;
  waiting: number;
  total: number;
};

export type WorkQueue = {
  items: WorkQueueItem[];
  summary: WorkQueueSummary;
};
