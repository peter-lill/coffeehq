import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { activeClaimAccessWhere } from "@/server/access/claim-access-policy";

function accessibleClaimWhere(
  userId: string,
  now: Date,
): Prisma.ClaimWhereInput {
  return {
    OR: [
      {
        ownerId: userId,
      },
      {
        accessGrants: {
          some: {
            userId,
            ...activeClaimAccessWhere(now),
          },
        },
      },
    ],
  };
}

export async function canUserAccessClaim(input: {
  claimId: string;
  userId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  const claim = await db.claim.findFirst({
    where: {
      id: input.claimId,
      ...accessibleClaimWhere(input.userId, now),
    },
    select: {
      id: true,
    },
  });

  return Boolean(claim);
}

export async function findAccessibleClaimByNumber(input: {
  claimNumber: string;
  userId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  return db.claim.findFirst({
    where: {
      claimNumber: input.claimNumber.toUpperCase(),
      deletedAt: null,
      ...accessibleClaimWhere(input.userId, now),
    },
  });
}

export async function listAccessibleClaims(input: {
  userId: string;
  includeClosed?: boolean;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  /*
   * The existing claims page continues to apply its active/inactive status
   * filter. This query applies the user-access boundary at database level.
   */
  return db.claim.findMany({
    where: accessibleClaimWhere(input.userId, now),
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        claimNumber: "asc",
      },
    ],
  });
}

export async function findAccessibleDocument(input: {
  documentId: string;
  userId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  return db.document.findFirst({
    where: {
      id: input.documentId,
      deletedAt: null,
      claim: accessibleClaimWhere(input.userId, now),
    },
    include: {
      claim: {
        select: {
          id: true,
          claimNumber: true,
        },
      },
    },
  });
}
