-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('HOT', 'WARM', 'COOL', 'COLD');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW', 'REVIEWING', 'PURSUING', 'PASSED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('UTAH_BONFIRE', 'STATE_BONFIRE', 'BIDNET', 'SAM_GOV', 'WORLD_BANK', 'UNGM', 'UNDP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issuingOrg" TEXT,
    "category" TEXT,
    "postedDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "estimatedValue" DOUBLE PRECISION,
    "estimatedValueLow" DOUBLE PRECISION,
    "estimatedValueHigh" DOUBLE PRECISION,
    "locationState" TEXT,
    "locationCity" TEXT,
    "locationCountry" TEXT NOT NULL DEFAULT 'USA',
    "isUtah" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "icpScore" INTEGER,
    "scoreBreakdown" JSONB,
    "tier" "Tier",
    "aiBrief" JSONB,
    "aiGeneratedAt" TIMESTAMP(3),
    "keywordsMatched" TEXT[],
    "status" "Status" NOT NULL DEFAULT 'NEW',
    "decision" TEXT,
    "assignedToId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawData" JSONB,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperRun" (
    "id" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "opportunitiesFound" INTEGER NOT NULL DEFAULT 0,
    "opportunitiesNew" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "ScraperRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE INDEX "Opportunity_tier_idx" ON "Opportunity"("tier");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE INDEX "Opportunity_deadline_idx" ON "Opportunity"("deadline");

-- CreateIndex
CREATE INDEX "Opportunity_isUtah_idx" ON "Opportunity"("isUtah");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_source_sourceId_key" ON "Opportunity"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
