import type { ClaimEventType, Prisma } from "@prisma/client";

import {
  createClaimEventRecord,
  listClaimEventRecords,
} from "@/server/repositories/claim-event-repository";

export type CreateClaimEventInput = {
  claimId: string;
  createdById?: string;
  type: ClaimEventType;
  title: string;
  description?: string;
  occurredAt?: Date;
  metadata?: Prisma.InputJsonValue;
};

export async function createClaimEvent(
  input: CreateClaimEventInput,
) {
  return createClaimEventRecord(input);
}

export async function getClaimEvents(claimId: string) {
  return listClaimEventRecords(claimId);
}
