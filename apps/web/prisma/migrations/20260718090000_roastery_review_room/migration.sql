CREATE TYPE "RoasteryBatchStatus" AS ENUM ('UPLOADED','PARSING','CLASSIFIED','AWAITING_REVIEW','APPROVED','IMPORTED','REJECTED','FAILED','ROLLED_BACK');
CREATE TYPE "RoasteryConversationStatus" AS ENUM ('STAGED','MATCH_SUGGESTED','READY','EXCLUDED','IMPORTED','FAILED','ROLLED_BACK');
CREATE TYPE "RoasteryMatchMethod" AS ENUM ('CLAIM_NUMBER','CLAIMANT_NAME','MANUAL','NONE');

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

CREATE TABLE "RoasteryAuditEvent" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RoasteryAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoasteryImportBatch_organisationId_sha256_key" ON "RoasteryImportBatch"("organisationId","sha256");
CREATE INDEX "RoasteryImportBatch_organisationId_status_uploadedAt_idx" ON "RoasteryImportBatch"("organisationId","status","uploadedAt");
CREATE INDEX "RoasteryImportBatch_uploadedById_uploadedAt_idx" ON "RoasteryImportBatch"("uploadedById","uploadedAt");
CREATE UNIQUE INDEX "RoasteryConversation_batchId_sourceConversationId_key" ON "RoasteryConversation"("batchId","sourceConversationId");
CREATE INDEX "RoasteryConversation_batchId_status_idx" ON "RoasteryConversation"("batchId","status");
CREATE INDEX "RoasteryConversation_suggestedClaimId_idx" ON "RoasteryConversation"("suggestedClaimId");
CREATE INDEX "RoasteryConversation_approvedClaimId_idx" ON "RoasteryConversation"("approvedClaimId");
CREATE INDEX "RoasteryAuditEvent_batchId_occurredAt_idx" ON "RoasteryAuditEvent"("batchId","occurredAt");
CREATE INDEX "RoasteryAuditEvent_actorId_occurredAt_idx" ON "RoasteryAuditEvent"("actorId","occurredAt");
ALTER TABLE "RoasteryConversation" ADD CONSTRAINT "RoasteryConversation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RoasteryImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoasteryAuditEvent" ADD CONSTRAINT "RoasteryAuditEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RoasteryImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
