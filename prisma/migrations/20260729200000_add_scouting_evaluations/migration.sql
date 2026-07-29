-- CreateEnum
CREATE TYPE "EvaluationCadence" AS ENUM ('POR_JOGO', 'PERIODICA');

-- CreateTable
CREATE TABLE "scouting_evaluations" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "cadence" "EvaluationCadence" NOT NULL,
    "scores" JSONB NOT NULL,
    "notas" TEXT NOT NULL DEFAULT '',
    "gameContext" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scouting_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scouting_evaluations_prospectId_idx" ON "scouting_evaluations"("prospectId");

-- AddForeignKey
ALTER TABLE "scouting_evaluations" ADD CONSTRAINT "scouting_evaluations_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

