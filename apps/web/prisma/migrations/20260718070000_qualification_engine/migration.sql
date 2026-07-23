CREATE TABLE "ClaimQualification" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "consentProvided" BOOLEAN NOT NULL DEFAULT false,
  "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
  "medicalCertificate" BOOLEAN NOT NULL DEFAULT false,
  "injuryDate" TIMESTAMP(3),
  "dateFirstSeen" TIMESTAMP(3),
  "certificateIssueDate" TIMESTAMP(3),
  "claimLodgementDate" TIMESTAMP(3),
  "diagnosis" TEXT,
  "capacity" TEXT,
  "treatingPractitioner" TEXT,
  "medicalFactors" TEXT,
  "firstSeenConsideration" TEXT,
  "issueDateConsideration" TEXT,
  "sixMonthConsideration" TEXT,
  "completedByName" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClaimQualification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClaimQualification_claimId_key" ON "ClaimQualification"("claimId");
CREATE INDEX "ClaimQualification_completedAt_idx" ON "ClaimQualification"("completedAt");
ALTER TABLE "ClaimQualification" ADD CONSTRAINT "ClaimQualification_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
