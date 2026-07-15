import type { ClaimEventType, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type CreateClaimEventInput = {
  claimId: string;
  createdById?: string;
  type: ClaimEventType;
  title: string;
  description?: string;
  occurredAt?: Date;
  metadata?: Prisma.InputJsonValue;
};

export async function createClaimEventRecord(
  input: CreateClaimEventInput,
) {
  return db.claimEvent.create({
    data: {
      claimId: input.claimId,
      createdById: input.createdById,
      type: input.type,
      title: input.title,
      description: input.description,
      occurredAt: input.occurredAt,
      metadata: input.metadata,
    },
  });
}

export async function listClaimEventRecords(claimId: string) {
  return db.claimEvent.findMany({
    where: {
      claimId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        occurredAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}
