import { db } from "@/lib/db";

export async function listWorkQueueClaimRecords() {
  return db.claim.findMany({
    where: {
      status: { not: "CLOSED" },
      deletedAt: null,
    },
    select: {
      id: true,
      claimNumber: true,
      claimantName: true,
      status: true,
      nextAction: true,
      determinationReadiness: true,
      updatedAt: true,
      evidenceRequirements: {
        where: {
          deletedAt: null,
          status: {
            in: ["OUTSTANDING", "REQUESTED"],
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          requestedFrom: true,
          requestedFromType: true,
          assignedOwner: true,
          dueDate: true,
          followUpDate: true,
          status: true,
          blockingDetermination: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { dueDate: "asc" },
          { followUpDate: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
    orderBy: [{ updatedAt: "desc" }, { claimNumber: "asc" }],
  });
}
