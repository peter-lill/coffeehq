import type { Prisma } from "@prisma/client";

export type ClaimAccessWindow = {
  startsAt: Date | null;
  endsAt: Date | null;
  revokedAt: Date | null;
};

export function isClaimAccessActive(
  access: ClaimAccessWindow,
  now: Date = new Date(),
): boolean {
  if (access.revokedAt) return false;

  if (
    access.startsAt &&
    access.startsAt.getTime() > now.getTime()
  ) {
    return false;
  }

  if (
    access.endsAt &&
    access.endsAt.getTime() <= now.getTime()
  ) {
    return false;
  }

  return true;
}

export function activeClaimAccessWhere(
  now: Date = new Date(),
): Prisma.ClaimAccessWhereInput {
  return {
    revokedAt: null,
    AND: [
      {
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
      },
      {
        OR: [
          { endsAt: null },
          { endsAt: { gt: now } },
        ],
      },
    ],
  };
}
