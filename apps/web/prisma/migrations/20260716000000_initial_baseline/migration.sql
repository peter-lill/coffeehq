-- CoffeeOS baseline for databases created before Prisma migration history was committed.
-- Existing CoffeeHQ databases must run `npm run db:prepare-migrations` before deploy.

CREATE TYPE "MembershipRole" AS ENUM ('ADMIN', 'MANAGER', 'CLAIMS_REPRESENTATIVE', 'REVIEWER', 'VIEWER');
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'AWAITING_EVIDENCE', 'UNDER_REVIEW', 'MEDICAL_REVIEW', 'DECISION_DRAFTING', 'READY_FOR_DETERMINATION', 'CLOSED');
CREATE TYPE "ClaimEventType" AS ENUM ('CLAIM_CREATED', 'CLAIM_UPDATED', 'EMAIL_RECEIVED', 'DOCUMENT_UPLOADED', 'DOCUMENT_MOVED_OUT', 'DOCUMENT_MOVED_IN', 'FILE_NOTE_CREATED', 'PHONE_CALL', 'TASK_CREATED', 'TASK_COMPLETED', 'MEDICAL_EVIDENCE_RECEIVED', 'EMPLOYER_RESPONSE_RECEIVED', 'WORKER_RESPONSE_RECEIVED', 'NATURAL_JUSTICE_ISSUED', 'DECISION_DRAFTED', 'DECISION_FINALISED', 'IMPORT_COMPLETED', 'EVIDENCE_REQUIREMENT_CREATED', 'EVIDENCE_REQUIREMENT_UPDATED', 'EVIDENCE_REQUEST_ISSUED', 'EVIDENCE_FOLLOW_UP_RECORDED', 'EVIDENCE_RECEIVED_LINKED', 'GENERAL');
CREATE TYPE "DocumentSource" AS ENUM ('MANUAL_UPLOAD', 'INCOMING_EMAIL', 'HISTORICAL_IMPORT', 'API', 'SYSTEM');
CREATE TYPE "DocumentCategory" AS ENUM ('MEDICAL', 'EMPLOYMENT', 'WORKER', 'EMPLOYER', 'WITNESS', 'PAYROLL', 'COMMUNICATION', 'PHOTO', 'VIDEO', 'OTHER');
CREATE TYPE "CommunicationDirection" AS ENUM ('INCOMING', 'OUTGOING');
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'PORTAL', 'INTERNAL_NOTE');
CREATE TYPE "CommunicationStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'FILED', 'NEEDS_REVIEW', 'FAILED', 'QUARANTINED');
CREATE TYPE "EvidenceRequirementStatus" AS ENUM ('OUTSTANDING', 'REQUESTED', 'RECEIVED', 'NOT_REQUIRED');
CREATE TYPE "EvidenceRequestedFromType" AS ENUM ('WORKER', 'EMPLOYER', 'DOCTOR', 'WITNESS', 'INTERNAL', 'OTHER');
CREATE TYPE "ClaimMatchMethod" AS ENUM ('CLAIM_NUMBER_SUBJECT', 'CLAIM_NUMBER_BODY', 'THREAD', 'MANUAL', 'UNMATCHED');

CREATE TABLE "Organisation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "MembershipRole" NOT NULL DEFAULT 'CLAIMS_REPRESENTATIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Claim" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "claimNumber" TEXT NOT NULL,
  "claimantName" TEXT NOT NULL,
  "injury" TEXT NOT NULL,
  "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
  "nextAction" TEXT NOT NULL,
  "determinationReadiness" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

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
  "manuallyFiledAt" TIMESTAMP(3),
  "manuallyFiledBy" TEXT,
  "manualFilingReason" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "eventId" TEXT,
  "communicationId" TEXT,
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

CREATE TABLE "EvidenceRequirement" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "category" "DocumentCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "requestedFromType" "EvidenceRequestedFromType",
  "requestedFrom" TEXT,
  "assignedOwner" TEXT,
  "requestedAt" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "followUpDate" TIMESTAMP(3),
  "blockingDetermination" BOOLEAN NOT NULL DEFAULT true,
  "status" "EvidenceRequirementStatus" NOT NULL DEFAULT 'OUTSTANDING',
  "completedAt" TIMESTAMP(3),
  "createdByName" TEXT,
  "updatedByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EvidenceRequirement_pkey" PRIMARY KEY ("id")
);

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

CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Membership_organisationId_userId_key" ON "Membership"("organisationId", "userId");
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");
CREATE UNIQUE INDEX "Claim_organisationId_claimNumber_key" ON "Claim"("organisationId", "claimNumber");
CREATE INDEX "Claim_organisationId_status_idx" ON "Claim"("organisationId", "status");
CREATE INDEX "ClaimEvent_claimId_occurredAt_idx" ON "ClaimEvent"("claimId", "occurredAt");
CREATE INDEX "ClaimEvent_claimId_type_idx" ON "ClaimEvent"("claimId", "type");
CREATE INDEX "ClaimEvent_createdById_idx" ON "ClaimEvent"("createdById");
CREATE UNIQUE INDEX "Communication_internetMessageId_key" ON "Communication"("internetMessageId");
CREATE INDEX "Communication_organisationId_status_receivedAt_idx" ON "Communication"("organisationId", "status", "receivedAt");
CREATE INDEX "Communication_claimId_receivedAt_idx" ON "Communication"("claimId", "receivedAt");
CREATE INDEX "Communication_threadId_idx" ON "Communication"("threadId");
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");
CREATE UNIQUE INDEX "Document_claimId_sha256_key" ON "Document"("claimId", "sha256");
CREATE INDEX "Document_claimId_createdAt_idx" ON "Document"("claimId", "createdAt");
CREATE INDEX "Document_eventId_idx" ON "Document"("eventId");
CREATE INDEX "Document_communicationId_idx" ON "Document"("communicationId");
CREATE INDEX "Document_claimId_category_idx" ON "Document"("claimId", "category");
CREATE INDEX "EvidenceRequirement_claimId_status_idx" ON "EvidenceRequirement"("claimId", "status");
CREATE INDEX "EvidenceRequirement_claimId_category_idx" ON "EvidenceRequirement"("claimId", "category");
CREATE INDEX "EvidenceRequirement_claimId_dueDate_idx" ON "EvidenceRequirement"("claimId", "dueDate");
CREATE INDEX "EvidenceRequirement_claimId_followUpDate_idx" ON "EvidenceRequirement"("claimId", "followUpDate");
CREATE UNIQUE INDEX "EvidenceRequirementLink_requirementId_documentId_key" ON "EvidenceRequirementLink"("requirementId", "documentId");
CREATE UNIQUE INDEX "EvidenceRequirementLink_requirementId_communicationId_key" ON "EvidenceRequirementLink"("requirementId", "communicationId");
CREATE INDEX "EvidenceRequirementLink_requirementId_linkedAt_idx" ON "EvidenceRequirementLink"("requirementId", "linkedAt");
CREATE INDEX "EvidenceRequirementLink_documentId_idx" ON "EvidenceRequirementLink"("documentId");
CREATE INDEX "EvidenceRequirementLink_communicationId_idx" ON "EvidenceRequirementLink"("communicationId");

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClaimEvent" ADD CONSTRAINT "ClaimEvent_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClaimEvent" ADD CONSTRAINT "ClaimEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClaimEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClaimEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceRequirement" ADD CONSTRAINT "EvidenceRequirement_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRequirementLink" ADD CONSTRAINT "EvidenceRequirementLink_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "EvidenceRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRequirementLink" ADD CONSTRAINT "EvidenceRequirementLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRequirementLink" ADD CONSTRAINT "EvidenceRequirementLink_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
