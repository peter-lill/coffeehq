-- CreateEnum
CREATE TYPE "ClaimEventType" AS ENUM ('CLAIM_CREATED', 'CLAIM_UPDATED', 'EMAIL_RECEIVED', 'DOCUMENT_UPLOADED', 'FILE_NOTE_CREATED', 'PHONE_CALL', 'TASK_CREATED', 'TASK_COMPLETED', 'MEDICAL_EVIDENCE_RECEIVED', 'EMPLOYER_RESPONSE_RECEIVED', 'WORKER_RESPONSE_RECEIVED', 'NATURAL_JUSTICE_ISSUED', 'DECISION_DRAFTED', 'DECISION_FINALISED', 'IMPORT_COMPLETED', 'GENERAL');

-- CreateTable
CREATE TABLE "ClaimEvent" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "createdById" TEXT,
    "type" "ClaimEventType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimEvent_claimId_occurredAt_idx" ON "ClaimEvent"("claimId", "occurredAt");

-- CreateIndex
CREATE INDEX "ClaimEvent_claimId_type_idx" ON "ClaimEvent"("claimId", "type");

-- CreateIndex
CREATE INDEX "ClaimEvent_createdById_idx" ON "ClaimEvent"("createdById");

-- AddForeignKey
ALTER TABLE "ClaimEvent" ADD CONSTRAINT "ClaimEvent_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvent" ADD CONSTRAINT "ClaimEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
