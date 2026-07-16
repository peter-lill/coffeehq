-- CreateEnum
CREATE TYPE "EvidenceRequirementStatus" AS ENUM (
  'OUTSTANDING',
  'REQUESTED',
  'RECEIVED',
  'NOT_REQUIRED'
);

-- ExtendEnum
ALTER TYPE "ClaimEventType" ADD VALUE 'EVIDENCE_REQUIREMENT_CREATED';
ALTER TYPE "ClaimEventType" ADD VALUE 'EVIDENCE_REQUIREMENT_UPDATED';

-- CreateTable
CREATE TABLE "EvidenceRequirement" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "category" "DocumentCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "requestedFrom" TEXT,
  "dueDate" TIMESTAMP(3),
  "status" "EvidenceRequirementStatus" NOT NULL DEFAULT 'OUTSTANDING',
  "completedAt" TIMESTAMP(3),
  "createdByName" TEXT,
  "updatedByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EvidenceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceRequirement_claimId_status_idx"
ON "EvidenceRequirement"("claimId", "status");

-- CreateIndex
CREATE INDEX "EvidenceRequirement_claimId_category_idx"
ON "EvidenceRequirement"("claimId", "category");

-- AddForeignKey
ALTER TABLE "EvidenceRequirement"
ADD CONSTRAINT "EvidenceRequirement_claimId_fkey"
FOREIGN KEY ("claimId") REFERENCES "Claim"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
