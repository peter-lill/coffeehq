CREATE TYPE "ClaimDecisionOutcome" AS ENUM ('ACCEPTED', 'REJECTED');

ALTER TABLE "Claim"
  ADD COLUMN "employerName" TEXT,
  ADD COLUMN "claimType" TEXT,
  ADD COLUMN "applicationDate" TIMESTAMP(3),
  ADD COLUMN "decisionOutcome" "ClaimDecisionOutcome",
  ADD COLUMN "closedAt" TIMESTAMP(3),
  ADD COLUMN "closedByName" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByName" TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Communication"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByName" TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Document"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByName" TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "EvidenceRequirement"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByName" TEXT,
  ADD COLUMN "deletionReason" TEXT;

CREATE INDEX "Claim_deletedAt_status_idx" ON "Claim"("deletedAt", "status");
CREATE INDEX "Communication_organisationId_deletedAt_receivedAt_idx" ON "Communication"("organisationId", "deletedAt", "receivedAt");
CREATE INDEX "Document_claimId_deletedAt_createdAt_idx" ON "Document"("claimId", "deletedAt", "createdAt");
CREATE INDEX "EvidenceRequirement_claimId_deletedAt_status_idx" ON "EvidenceRequirement"("claimId", "deletedAt", "status");
