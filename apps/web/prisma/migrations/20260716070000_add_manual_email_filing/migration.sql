ALTER TABLE "Communication"
  ADD COLUMN "manuallyFiledAt" TIMESTAMP(3),
  ADD COLUMN "manuallyFiledBy" TEXT,
  ADD COLUMN "manualFilingReason" TEXT;
