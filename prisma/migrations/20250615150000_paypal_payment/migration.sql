-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'PAYPAL';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "paypalPayerId" TEXT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "paypalPlanId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "paypalSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "paypal_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paypal_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypalPlanId_key" ON "plans"("paypalPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paypalSubscriptionId_key" ON "subscriptions"("paypalSubscriptionId");
