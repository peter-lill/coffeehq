-- CreateEnum
CREATE TYPE "ClaimAccessLevel" AS ENUM ('EDIT', 'VIEW');

-- CreateEnum
CREATE TYPE "ClaimAccessReason" AS ENUM ('SHARED', 'LEAVE_DELEGATION', 'MANAGER_SUPPORT', 'TRANSFER_HANDOVER', 'OTHER');

-- CreateEnum
CREATE TYPE "RoasteryBatchStatus" AS ENUM ('UPLOADED', 'PARSING', 'CLASSIFIED', 'AWAITING_REVIEW', 'APPROVED', 'IMPORTED', 'REJECTED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "RoasteryConversationStatus" AS ENUM ('STAGED', 'MATCH_SUGGESTED', 'READY', 'EXCLUDED', 'IMPORTED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "RoasteryMatchMethod" AS ENUM ('CLAIM_NUMBER', 'CLAIMANT_NAME', 'MANUAL', 'NONE');

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "RoasteryImportBatch" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "proposedOwnerId" TEXT,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" "RoasteryBatchStatus" NOT NULL DEFAULT 'UPLOADED',
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "stagedConversations" INTEGER NOT NULL DEFAULT 0,
    "importedConversations" INTEGER NOT NULL DEFAULT 0,
    "failedConversations" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsingStartedAt" TIMESTAMP(3),
    "parsingCompletedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoasteryImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoasteryConversation" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sourceConversationId" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceCreatedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "status" "RoasteryConversationStatus" NOT NULL DEFAULT 'STAGED',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "participantNames" TEXT[],
    "detectedClaimNumbers" TEXT[],
    "searchText" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,
    "suggestedClaimId" TEXT,
    "approvedClaimId" TEXT,
    "matchMethod" "RoasteryMatchMethod" NOT NULL DEFAULT 'NONE',
    "matchConfidence" DOUBLE PRECISION,
    "reviewNotes" TEXT,
    "importedEventIds" TEXT[],
    "importedDocumentIds" TEXT[],
    "importedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoasteryConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoasteryAuditEvent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoasteryAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimAccess_claimId_userId_idx" ON "ClaimAccess"("claimId", "userId");

-- CreateIndex
CREATE INDEX "ClaimAccess_userId_revokedAt_startsAt_endsAt_idx" ON "ClaimAccess"("userId", "revokedAt", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "ClaimAccess_claimId_revokedAt_idx" ON "ClaimAccess"("claimId", "revokedAt");

-- CreateIndex
CREATE INDEX "ClaimAccessAudit_claimId_occurredAt_idx" ON "ClaimAccessAudit"("claimId", "occurredAt");

-- CreateIndex
CREATE INDEX "ClaimAccessAudit_actorId_occurredAt_idx" ON "ClaimAccessAudit"("actorId", "occurredAt");

-- CreateIndex
CREATE INDEX "RoasteryImportBatch_organisationId_status_uploadedAt_idx" ON "RoasteryImportBatch"("organisationId", "status", "uploadedAt");

-- CreateIndex
CREATE INDEX "RoasteryImportBatch_uploadedById_uploadedAt_idx" ON "RoasteryImportBatch"("uploadedById", "uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoasteryImportBatch_organisationId_sha256_key" ON "RoasteryImportBatch"("organisationId", "sha256");

-- CreateIndex
CREATE INDEX "RoasteryConversation_batchId_status_idx" ON "RoasteryConversation"("batchId", "status");

-- CreateIndex
CREATE INDEX "RoasteryConversation_suggestedClaimId_idx" ON "RoasteryConversation"("suggestedClaimId");

-- CreateIndex
CREATE INDEX "RoasteryConversation_approvedClaimId_idx" ON "RoasteryConversation"("approvedClaimId");

-- CreateIndex
CREATE UNIQUE INDEX "RoasteryConversation_batchId_sourceConversationId_key" ON "RoasteryConversation"("batchId", "sourceConversationId");

-- CreateIndex
CREATE INDEX "RoasteryAuditEvent_batchId_occurredAt_idx" ON "RoasteryAuditEvent"("batchId", "occurredAt");

-- CreateIndex
CREATE INDEX "RoasteryAuditEvent_actorId_occurredAt_idx" ON "RoasteryAuditEvent"("actorId", "occurredAt");

-- AddForeignKey
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAccess" ADD CONSTRAINT "ClaimAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAccessAudit" ADD CONSTRAINT "ClaimAccessAudit_claimAccessId_fkey" FOREIGN KEY ("claimAccessId") REFERENCES "ClaimAccess"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAccessAudit" ADD CONSTRAINT "ClaimAccessAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoasteryConversation" ADD CONSTRAINT "RoasteryConversation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RoasteryImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoasteryAuditEvent" ADD CONSTRAINT "RoasteryAuditEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RoasteryImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
