ALTER TABLE "Payment"
ADD COLUMN "providerPaymentId" TEXT,
ADD COLUMN "providerRawStatus" TEXT,
ADD COLUMN "providerTransactionUrl" TEXT,
ADD COLUMN "providerResponseSnapshot" JSONB,
ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Payment_providerPaymentId_key"
ON "Payment"("providerPaymentId");

CREATE INDEX "Payment_provider_providerRawStatus_idx"
ON "Payment"("provider", "providerRawStatus");
