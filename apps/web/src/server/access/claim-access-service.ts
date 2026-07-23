import "server-only";

import { notFound } from "next/navigation";

import { requireCurrentUser } from "@/server/auth/current-user";
import {
  canUserAccessClaim,
  findAccessibleClaimByNumber,
  findAccessibleDocument,
  listAccessibleClaims,
} from "@/server/access/claim-access-repository";

export class ClaimAccessDeniedError extends Error {
  constructor() {
    super("Claim access denied.");
    this.name = "ClaimAccessDeniedError";
  }
}

export async function requireClaimByNumber(claimNumber: string) {
  const user = await requireCurrentUser();
  const claim = await findAccessibleClaimByNumber({
    claimNumber,
    userId: user.id,
  });

  // Return 404 rather than confirming that another user's claim exists.
  if (!claim) notFound();

  return claim;
}

export async function requireClaimAccess(claimId: string) {
  const user = await requireCurrentUser();
  const allowed = await canUserAccessClaim({
    claimId,
    userId: user.id,
  });

  if (!allowed) throw new ClaimAccessDeniedError();

  return user;
}

export async function getCurrentUserClaims(input?: {
  includeClosed?: boolean;
}) {
  const user = await requireCurrentUser();

  return listAccessibleClaims({
    userId: user.id,
    includeClosed: input?.includeClosed,
  });
}

export async function requireAccessibleDocument(documentId: string) {
  const user = await requireCurrentUser();
  const document = await findAccessibleDocument({
    documentId,
    userId: user.id,
  });

  if (!document) notFound();

  return document;
}
