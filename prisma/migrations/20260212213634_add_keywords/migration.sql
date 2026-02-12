-- CreateEnum
CREATE TYPE "KeywordType" AS ENUM ('INCLUDE', 'EXCLUDE');

-- CreateEnum
CREATE TYPE "KeywordTier" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "type" "KeywordType" NOT NULL,
    "tier" "KeywordTier" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "lastMatchAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityKeyword" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "matchLocation" TEXT,
    "matchedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_term_key" ON "Keyword"("term");

-- CreateIndex
CREATE INDEX "Keyword_type_idx" ON "Keyword"("type");

-- CreateIndex
CREATE INDEX "Keyword_isActive_idx" ON "Keyword"("isActive");

-- CreateIndex
CREATE INDEX "Keyword_category_idx" ON "Keyword"("category");

-- CreateIndex
CREATE INDEX "OpportunityKeyword_keywordId_idx" ON "OpportunityKeyword"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityKeyword_opportunityId_keywordId_key" ON "OpportunityKeyword"("opportunityId", "keywordId");

-- AddForeignKey
ALTER TABLE "OpportunityKeyword" ADD CONSTRAINT "OpportunityKeyword_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityKeyword" ADD CONSTRAINT "OpportunityKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
