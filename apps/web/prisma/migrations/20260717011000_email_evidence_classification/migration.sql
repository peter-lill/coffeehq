ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_CLASSIFIED';

ALTER TABLE "Communication"
ADD COLUMN "evidenceCategory" "DocumentCategory",
ADD COLUMN "evidenceTitle" TEXT,
ADD COLUMN "evidenceDescription" TEXT,
ADD COLUMN "evidenceRelevance" TEXT,
ADD COLUMN "evidenceReviewedAt" TIMESTAMP(3),
ADD COLUMN "evidenceReviewedByName" TEXT;
