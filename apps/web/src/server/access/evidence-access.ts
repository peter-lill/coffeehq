import "server-only";

import { db } from "@/lib/db";
import { activeClaimAccessWhere } from "@/server/access/claim-access-policy";
import { requireCurrentUser } from "@/server/auth/current-user";

export async function listAccessibleClaimsForEvidence() {
  const user = await requireCurrentUser();
  return db.claim.findMany({
    where: {
      deletedAt: null,
      status: { not: "CLOSED" },
      OR: [
        { ownerId: user.id },
        { accessGrants: { some: { userId: user.id, ...activeClaimAccessWhere(new Date()) } } },
      ],
    },
    select: {
      id: true,
      claimNumber: true,
      claimantName: true,
      status: true,
      _count: {
        select: {
          documents: { where: { deletedAt: null } },
          communications: { where: { deletedAt: null } },
        },
      },
      evidenceRequirements: {
        where: { deletedAt: null, status: { in: ["OUTSTANDING", "REQUESTED"] } },
        select: { status: true, dueDate: true, followUpDate: true, blockingDetermination: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { claimNumber: "asc" }],
  });
}
