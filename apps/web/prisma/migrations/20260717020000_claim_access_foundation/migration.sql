CREATE TYPE "ClaimAccessLevel" AS ENUM ('EDIT', 'VIEW');
CREATE TYPE "ClaimAccessReason" AS ENUM ('SHARED', 'LEAVE_DELEGATION', 'MANAGER_SUPPORT', 'TRANSFER_HANDOVER', 'OTHER');

ALTER TABLE "Claim" ADD COLUMN "ownerId" TEXT;

CREATE TABLE "ClaimAccess" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "level" "ClaimAccessLevel" NOT NULL,
  "reason" "ClaimAccessReason" NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "grantedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClaimAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClaimAccessAudit" (
  "id" TEXT NOT NULL,
  "claimAccessId" TEXT,
  "claimId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClaimAccessAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Claim_ownerId_idx" ON "Claim"("ownerId");
CREATE INDEX "ClaimAccess_claimId_userId_idx" ON "ClaimAccess"("claimId", "userId");
CREATE INDEX "ClaimAccess_userId_revokedAt_startsAt_endsAt_idx" ON "ClaimAccess"("userId", "revokedAt", "startsAt", "endsAt");
CREATE INDEX "ClaimAccess_claimId_revokedAt_idx" ON "ClaimAccess"("claimId", "revokedAt");
CREATE INDEX "ClaimAccessAudit_claimId_occurredAt_idx" ON "ClaimAccessAudit"("claimId", "occurredAt");
CREATE INDEX "ClaimAccessAudit_actorId_occurredAt_idx" ON "ClaimAccessAudit"("actorId", "occurredAt");

ALTER TABLE "Claim" ADD CONSTRAINT "Claim_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClaimAccessAudit" ADD CONSTRAINT "ClaimAccessAudit_claimAccessId_fkey" FOREIGN KEY ("claimAccessId") REFERENCES "ClaimAccess"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClaimAccessAudit" ADD CONSTRAINT "ClaimAccessAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
