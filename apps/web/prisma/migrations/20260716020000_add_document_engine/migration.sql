-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('MANUAL_UPLOAD', 'INCOMING_EMAIL', 'HISTORICAL_IMPORT', 'API', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('MEDICAL', 'EMPLOYMENT', 'WORKER', 'EMPLOYER', 'WITNESS', 'PAYROLL', 'COMMUNICATION', 'PHOTO', 'VIDEO', 'OTHER');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "eventId" TEXT,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "source" "DocumentSource" NOT NULL DEFAULT 'MANUAL_UPLOAD',
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");
CREATE UNIQUE INDEX "Document_claimId_sha256_key" ON "Document"("claimId", "sha256");
CREATE INDEX "Document_claimId_createdAt_idx" ON "Document"("claimId", "createdAt");
CREATE INDEX "Document_eventId_idx" ON "Document"("eventId");
CREATE INDEX "Document_claimId_category_idx" ON "Document"("claimId", "category");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClaimEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
