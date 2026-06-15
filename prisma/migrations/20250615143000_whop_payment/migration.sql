-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'WHOP');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "whopMemberId" TEXT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "whopPlanId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE';
ALTER TABLE "subscriptions" ADD COLUMN "whopMembershipId" TEXT;
ALTER TABLE "subscriptions" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "whop_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whop_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_whopMemberId_key" ON "organizations"("whopMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_whopPlanId_key" ON "plans"("whopPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_whopMembershipId_key" ON "subscriptions"("whopMembershipId");
