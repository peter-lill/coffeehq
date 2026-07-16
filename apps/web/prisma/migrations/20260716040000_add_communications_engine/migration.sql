CREATE TYPE "CommunicationDirection" AS ENUM ('INCOMING', 'OUTGOING');
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'PORTAL', 'INTERNAL_NOTE');
CREATE TYPE "CommunicationStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'FILED', 'NEEDS_REVIEW', 'FAILED', 'QUARANTINED');
CREATE TYPE "ClaimMatchMethod" AS ENUM ('CLAIM_NUMBER_SUBJECT', 'CLAIM_NUMBER_BODY', 'THREAD', 'MANUAL', 'UNMATCHED');

ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_MOVED_OUT';
ALTER TYPE "ClaimEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_MOVED_IN';

CREATE TABLE "Communication" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "claimId" TEXT,
  "eventId" TEXT,
  "direction" "CommunicationDirection" NOT NULL DEFAULT 'INCOMING',
  "channel" "CommunicationChannel" NOT NULL DEFAULT 'EMAIL',
  "status" "CommunicationStatus" NOT NULL DEFAULT 'RECEIVED',
  "matchMethod" "ClaimMatchMethod" NOT NULL DEFAULT 'UNMATCHED',
  "matchConfidence" INTEGER NOT NULL DEFAULT 0,
  "sender" TEXT NOT NULL,
  "recipients" JSONB NOT NULL,
  "ccRecipients" JSONB,
  "subject" TEXT NOT NULL,
  "bodyText" TEXT,
  "bodyHtml" TEXT,
  "internetMessageId" TEXT,
  "threadId" TEXT,
  "rawStorageKey" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Document" ADD COLUMN "communicationId" TEXT;

CREATE UNIQUE INDEX "Communication_internetMessageId_key" ON "Communication"("internetMessageId");
CREATE INDEX "Communication_organisationId_status_receivedAt_idx" ON "Communication"("organisationId", "status", "receivedAt");
CREATE INDEX "Communication_claimId_receivedAt_idx" ON "Communication"("claimId", "receivedAt");
CREATE INDEX "Communication_threadId_idx" ON "Communication"("threadId");
CREATE INDEX "Document_communicationId_idx" ON "Document"("communicationId");

ALTER TABLE "Communication" ADD CONSTRAINT "Communication_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClaimEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
