-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "budgetWeight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "sectorWeight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "geographyWeight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "timingWeight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "utahMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
);
