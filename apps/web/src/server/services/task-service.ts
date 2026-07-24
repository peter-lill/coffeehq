import type {
  WorkQueue,
  WorkQueueItem,
  WorkQueuePriority,
} from "@/server/tasks/types";
import { listWorkQueueClaimRecords } from "@/server/repositories/task-repository";

const claimStatusLabels: Record<string, string> = {
  OPEN: "Open",
  AWAITING_EVIDENCE: "Awaiting evidence",
  UNDER_REVIEW: "Under review",
  MEDICAL_REVIEW: "Medical review",
  DECISION_DRAFTING: "Decision drafting",
  READY_FOR_DETERMINATION: "Ready for determination",
  CLOSED: "Closed",
};

function BrisbaneDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Australia/Brisbane",
  }).format(date);
}

function classifyEvidencePriority(
  dueDate: Date | null,
  followUpDate: Date | null,
): WorkQueuePriority {
  const today = BrisbaneDateKey(new Date());
  const actionDate = dueDate ?? followUpDate;

  if (!actionDate) {
    return "WAITING";
  }

  const actionDateKey = BrisbaneDateKey(actionDate);

  if (actionDateKey < today) {
    return "OVERDUE";
  }

  if (actionDateKey === today) {
    return "DUE_TODAY";
  }

  return "UPCOMING";
}

function priorityRank(priority: WorkQueuePriority): number {
  const ranks: Record<WorkQueuePriority, number> = {
    OVERDUE: 0,
    DUE_TODAY: 1,
    READY: 2,
    UPCOMING: 3,
    WAITING: 4,
  };

  return ranks[priority];
}

export async function getWorkQueue(): Promise<WorkQueue> {
  const claims = await listWorkQueueClaimRecords();
  const items: WorkQueueItem[] = [];

  for (const claim of claims) {
    for (const requirement of claim.evidenceRequirements) {
      items.push({
        id: `evidence-${requirement.id}`,
        source: "EVIDENCE",
        priority: classifyEvidencePriority(
          requirement.dueDate,
          requirement.followUpDate,
        ),
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimantName: claim.claimantName,
        claimStatus: claimStatusLabels[claim.status] ?? claim.status,
        title: requirement.title,
        description:
          requirement.description ??
          requirement.requestedFrom ??
          (requirement.requestedFromType
            ? `Requested from ${requirement.requestedFromType.toLowerCase()}`
            : null),
        category: requirement.category,
        assignedOwner: requirement.assignedOwner,
        dueDate: requirement.dueDate,
        followUpDate: requirement.followUpDate,
        blockingDetermination: requirement.blockingDetermination,
        determinationReadiness: claim.determinationReadiness,
        href: `/claims/${encodeURIComponent(claim.claimNumber)}`,
      });
    }

    const hasActiveBlocker = claim.evidenceRequirements.some(
      (requirement) => requirement.blockingDetermination,
    );

    if (
      claim.status === "READY_FOR_DETERMINATION" ||
      (claim.determinationReadiness >= 100 && !hasActiveBlocker)
    ) {
      items.push({
        id: `claim-ready-${claim.id}`,
        source: "CLAIM",
        priority: "READY",
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimantName: claim.claimantName,
        claimStatus: claimStatusLabels[claim.status] ?? claim.status,
        title: "Claim ready for determination",
        description: claim.nextAction,
        category: null,
        assignedOwner: null,
        dueDate: null,
        followUpDate: null,
        blockingDetermination: false,
        determinationReadiness: claim.determinationReadiness,
        href: `/claims/${encodeURIComponent(claim.claimNumber)}`,
      });
    } else if (claim.evidenceRequirements.length === 0) {
      items.push({
        id: `claim-action-${claim.id}`,
        source: "CLAIM",
        priority: "WAITING",
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimantName: claim.claimantName,
        claimStatus: claimStatusLabels[claim.status] ?? claim.status,
        title: claim.nextAction || "Review claim and confirm next action",
        description: null,
        category: null,
        assignedOwner: null,
        dueDate: null,
        followUpDate: null,
        blockingDetermination: false,
        determinationReadiness: claim.determinationReadiness,
        href: `/claims/${encodeURIComponent(claim.claimNumber)}`,
      });
    }
  }

  items.sort((left, right) => {
    const priorityDifference =
      priorityRank(left.priority) - priorityRank(right.priority);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const leftDate = left.dueDate ?? left.followUpDate;
    const rightDate = right.dueDate ?? right.followUpDate;

    if (leftDate && rightDate) {
      const dateDifference = leftDate.getTime() - rightDate.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }
    }

    if (leftDate && !rightDate) {
      return -1;
    }

    if (!leftDate && rightDate) {
      return 1;
    }

    return left.claimNumber.localeCompare(right.claimNumber);
  });

  return {
    items,
    summary: {
      overdue: items.filter((item) => item.priority === "OVERDUE").length,
      dueToday: items.filter((item) => item.priority === "DUE_TODAY").length,
      ready: items.filter((item) => item.priority === "READY").length,
      upcoming: items.filter((item) => item.priority === "UPCOMING").length,
      waiting: items.filter((item) => item.priority === "WAITING").length,
      total: items.length,
    },
  };
}
