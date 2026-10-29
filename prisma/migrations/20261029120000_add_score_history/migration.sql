CREATE TABLE "score_history" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "score_history_athleteId_competencyId_recordedAt_idx" ON "score_history"("athleteId", "competencyId", "recordedAt");

ALTER TABLE "score_history" ADD CONSTRAINT "score_history_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "score_history" ADD CONSTRAINT "score_history_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
