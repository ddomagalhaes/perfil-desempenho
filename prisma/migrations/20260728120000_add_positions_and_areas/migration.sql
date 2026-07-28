-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('PSYCHOLOGICAL', 'TECHNICAL');

-- AlterTable: tag existing competencies as Psychological (no data loss), rename ordering column
ALTER TABLE "competencies" ADD COLUMN "area" "AreaType" NOT NULL DEFAULT 'PSYCHOLOGICAL';
ALTER TABLE "competencies" RENAME COLUMN "position" TO "sortOrder";

-- AlterTable: rename ordering column, add nullable player-position link
ALTER TABLE "athletes" RENAME COLUMN "position" TO "sortOrder";
ALTER TABLE "athletes" ADD COLUMN "positionId" TEXT;

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_competencies" (
    "positionId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "position_competencies_pkey" PRIMARY KEY ("positionId","competencyId")
);

-- CreateIndex
CREATE INDEX "athletes_positionId_idx" ON "athletes"("positionId");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_competencies" ADD CONSTRAINT "position_competencies_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_competencies" ADD CONSTRAINT "position_competencies_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
