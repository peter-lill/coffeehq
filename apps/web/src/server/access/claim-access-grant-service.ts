import "server-only";

import type {
  ClaimAccessLevel,
  ClaimAccessReason,
} from "@prisma/client";

import { db } from "@/lib/db";
import { requireCurrentUser } from "@/server/auth/current-user";
import { requireClaimAccess } from "@/server/access/claim-access-service";

function validateWindow(input: {
  startsAt?: Date | null;
  endsAt?: Date | null;
}) {
  if (
    input.startsAt &&
    input.endsAt &&
    input.endsAt.getTime() <= input.startsAt.getTime()
  ) {
    throw new Error("Delegated access must end after it starts.");
  }
}

export async function grantClaimAccess(input: {
  claimId: string;
  userId: string;
  level: ClaimAccessLevel;
  reason: ClaimAccessReason;
  startsAt?: Date | null;
  endsAt?: Date | null;
}) {
  validateWindow(input);

  const actor = await requireCurrentUser();
  await requireClaimAccess(input.claimId);

  if (input.userId === actor.id) {
    throw new Error("The current claim owner or user does not need a self-grant.");
  }

  return db.$transaction(async (transaction) => {
    const access = await transaction.claimAccess.create({
      data: {
        claimId: input.claimId,
        userId: input.userId,
        level: input.level,
        reason: input.reason,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        grantedById: actor.id,
      },
    });

    await transaction.claimAccessAudit.create({
      data: {
        claimAccessId: access.id,
        claimId: input.claimId,
        actorId: actor.id,
        action: "CLAIM_ACCESS_GRANTED",
        metadata: {
          userId: input.userId,
          level: input.level,
          reason: input.reason,
          startsAt: input.startsAt?.toISOString() ?? null,
          endsAt: input.endsAt?.toISOString() ?? null,
        },
      },
    });

    return access;
  });
}

export async function revokeClaimAccess(claimAccessId: string) {
  const actor = await requireCurrentUser();

  const access = await db.claimAccess.findUnique({
    where: { id: claimAccessId },
    select: {
      id: true,
      claimId: true,
      revokedAt: true,
    },
  });

  if (!access) throw new Error("Claim access grant was not found.");
  await requireClaimAccess(access.claimId);

  if (access.revokedAt) return access;

  return db.$transaction(async (transaction) => {
    const revoked = await transaction.claimAccess.update({
      where: { id: claimAccessId },
      data: { revokedAt: new Date() },
    });

    await transaction.claimAccessAudit.create({
      data: {
        claimAccessId,
        claimId: access.claimId,
        actorId: actor.id,
        action: "CLAIM_ACCESS_REVOKED",
      },
    });

    return revoked;
  });
}
