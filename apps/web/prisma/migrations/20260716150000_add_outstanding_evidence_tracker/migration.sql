-- CreateEnum
CREATE TYPE "EvidenceRequestedFromType" AS ENUM (
  'WORKER',
  'EMPLOYER',
  'DOCTOR',
  'WITNESS',
  'INTERNAL',
  'OTHER'
);

-- ExtendEnum
ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_REQUEST_ISSUED';
ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_FOLLOW_UP_RECORDED';
ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_RECEIVED_LINKED';

-- AlterTable
ALTER TABLE "EvidenceRequirement"
ADD COLUMN "requestedFromType" "EvidenceRequestedFromType",
ADD COLUMN "assignedOwner" TEXT,
ADD COLUMN "requestedAt" TIMESTAMP(3),
ADD COLUMN "followUpDate" TIMESTAMP(3),
ADD COLUMN "blockingDetermination" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "EvidenceRequirementLink" (
  "id" TEXT NOT NULL,
  "requirementId" TEXT NOT NULL,
  "documentId" TEXT,
  "communicationId" TEXT,
  "linkedByName" TEXT,
  "note" TEXT,
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EvidenceRequirementLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceRequirement_claimId_dueDate_idx"
ON "EvidenceRequirement"("claimId", "dueDate");

CREATE INDEX "EvidenceRequirement_claimId_followUpDate_idx"
ON "EvidenceRequirement"("claimId", "followUpDate");

CREATE UNIQUE INDEX "EvidenceRequirementLink_requirementId_documentId_key"
ON "EvidenceRequirementLink"("requirementId", "documentId");

CREATE UNIQUE INDEX "EvidenceRequirementLink_requirementId_communicationId_key"
ON "EvidenceRequirementLink"("requirementId", "communicationId");

CREATE INDEX "EvidenceRequirementLink_requirementId_linkedAt_idx"
ON "EvidenceRequirementLink"("requirementId", "linkedAt");

CREATE INDEX "EvidenceRequirementLink_documentId_idx"
ON "EvidenceRequirementLink"("documentId");

CREATE INDEX "EvidenceRequirementLink_communicationId_idx"
ON "EvidenceRequirementLink"("communicationId");

-- AddForeignKey
ALTER TABLE "EvidenceRequirementLink"
ADD CONSTRAINT "EvidenceRequirementLink_requirementId_fkey"
FOREIGN KEY ("requirementId") REFERENCES "EvidenceRequirement"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvidenceRequirementLink"
ADD CONSTRAINT "EvidenceRequirementLink_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "Document"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvidenceRequirementLink"
ADD CONSTRAINT "EvidenceRequirementLink_communicationId_fkey"
FOREIGN KEY ("communicationId") REFERENCES "Communication"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
