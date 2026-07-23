import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { activeClaimAccessWhere } from "@/server/access/claim-access-policy";
import type { DeletableItemType } from "@/server/deleted-items/types";

function claimAccessWhere(userId: string): Prisma.ClaimWhereInput {
  return {
    OR: [
      { ownerId: userId },
      {
        accessGrants: {
          some: { userId, ...activeClaimAccessWhere(new Date()) },
        },
      },
    ],
  };
}

function communicationAccessWhere(
  userId: string,
  organisationId: string,
  canReviewUnmatched: boolean,
): Prisma.CommunicationWhereInput {
  const access: Prisma.CommunicationWhereInput[] = [
    { claim: { is: claimAccessWhere(userId) } },
  ];

  if (canReviewUnmatched) {
    access.push({ claimId: null, organisationId });
  }

  return { OR: access };
}

export async function softDeleteRecord(input: {
  type: DeletableItemType;
  id: string;
  userId: string;
  organisationId: string;
  canReviewUnmatched: boolean;
  deletedByName: string;
  reason: string;
}) {
  const data = {
    deletedAt: new Date(),
    deletedByName: input.deletedByName,
    deletionReason: input.reason,
  };

  switch (input.type) {
    case "CLAIM":
      return db.claim.updateMany({
        where: {
          id: input.id,
          organisationId: input.organisationId,
          deletedAt: null,
          ...claimAccessWhere(input.userId),
        },
        data,
      });
    case "DOCUMENT":
      return db.document.updateMany({
        where: {
          id: input.id,
          deletedAt: null,
          claim: {
            organisationId: input.organisationId,
            deletedAt: null,
            ...claimAccessWhere(input.userId),
          },
        },
        data,
      });
    case "COMMUNICATION":
      return db.communication.updateMany({
        where: {
          id: input.id,
          deletedAt: null,
          ...communicationAccessWhere(
            input.userId,
            input.organisationId,
            input.canReviewUnmatched,
          ),
        },
        data,
      });
    case "EVIDENCE_REQUIREMENT":
      return db.evidenceRequirement.updateMany({
        where: {
          id: input.id,
          deletedAt: null,
          claim: {
            organisationId: input.organisationId,
            deletedAt: null,
            ...claimAccessWhere(input.userId),
          },
        },
        data,
      });
  }
}

export async function listDeletedRecords(input: {
  userId: string;
  organisationId: string;
  canReviewUnmatched: boolean;
}) {
  const access = claimAccessWhere(input.userId);
  const [claims, documents, communications, requirements] = await Promise.all([
    db.claim.findMany({
      where: {
        organisationId: input.organisationId,
        deletedAt: { not: null },
        ...access,
      },
      orderBy: { deletedAt: "desc" },
    }),
    db.document.findMany({
      where: {
        deletedAt: { not: null },
        claim: {
          organisationId: input.organisationId,
          deletedAt: null,
          ...access,
        },
      },
      include: { claim: { select: { claimNumber: true, claimantName: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    db.communication.findMany({
      where: {
        organisationId: input.organisationId,
        deletedAt: { not: null },
        ...communicationAccessWhere(
          input.userId,
          input.organisationId,
          input.canReviewUnmatched,
        ),
      },
      include: { claim: { select: { claimNumber: true, claimantName: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    db.evidenceRequirement.findMany({
      where: {
        deletedAt: { not: null },
        claim: {
          organisationId: input.organisationId,
          deletedAt: null,
          ...access,
        },
      },
      include: { claim: { select: { claimNumber: true, claimantName: true } } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return { claims, documents, communications, requirements };
}

export async function restoreDeletedRecord(input: {
  type: DeletableItemType;
  id: string;
  userId: string;
  organisationId: string;
  canReviewUnmatched: boolean;
}) {
  const data = { deletedAt: null, deletedByName: null, deletionReason: null };
  const access = claimAccessWhere(input.userId);

  switch (input.type) {
    case "CLAIM":
      return db.claim.updateMany({
        where: {
          id: input.id,
          organisationId: input.organisationId,
          ...access,
        },
        data,
      });
    case "DOCUMENT":
      return db.document.updateMany({
        where: {
          id: input.id,
          claim: { organisationId: input.organisationId, ...access },
        },
        data,
      });
    case "COMMUNICATION":
      return db.communication.updateMany({
        where: {
          id: input.id,
          organisationId: input.organisationId,
          ...communicationAccessWhere(
            input.userId,
            input.organisationId,
            input.canReviewUnmatched,
          ),
        },
        data,
      });
    case "EVIDENCE_REQUIREMENT":
      return db.evidenceRequirement.updateMany({
        where: {
          id: input.id,
          claim: { organisationId: input.organisationId, ...access },
        },
        data,
      });
  }
}

export async function findPermanentDeleteTarget(input: {
  type: DeletableItemType;
  id: string;
  userId: string;
  organisationId: string;
}) {
  const access = claimAccessWhere(input.userId);
  switch (input.type) {
    case "CLAIM":
      return db.claim.findFirst({
        where: {
          id: input.id,
          organisationId: input.organisationId,
          deletedAt: { not: null },
          ...access,
        },
        include: {
          documents: { select: { storageKey: true } },
          communications: { select: { rawStorageKey: true } },
        },
      });
    case "DOCUMENT":
      return db.document.findFirst({
        where: {
          id: input.id,
          deletedAt: { not: null },
          claim: { organisationId: input.organisationId, ...access },
        },
      });
    case "COMMUNICATION":
      return db.communication.findFirst({
        where: {
          id: input.id,
          organisationId: input.organisationId,
          deletedAt: { not: null },
          ...communicationAccessWhere(
            input.userId,
            input.organisationId,
            true,
          ),
        },
      });
    case "EVIDENCE_REQUIREMENT":
      return db.evidenceRequirement.findFirst({
        where: {
          id: input.id,
          deletedAt: { not: null },
          claim: { organisationId: input.organisationId, ...access },
        },
      });
  }
}

export async function permanentlyDeleteRecord(input: {
  type: DeletableItemType;
  id: string;
}) {
  switch (input.type) {
    case "CLAIM":
      return db.$transaction(async (transaction) => {
        await transaction.communication.deleteMany({
          where: { claimId: input.id },
        });
        return transaction.claim.delete({ where: { id: input.id } });
      });
    case "DOCUMENT":
      return db.document.delete({ where: { id: input.id } });
    case "COMMUNICATION":
      return db.communication.delete({ where: { id: input.id } });
    case "EVIDENCE_REQUIREMENT":
      return db.evidenceRequirement.delete({ where: { id: input.id } });
  }
}
