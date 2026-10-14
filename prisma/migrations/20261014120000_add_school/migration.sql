-- CreateEnum
CREATE TYPE "SchoolGroup" AS ENUM ('POUSADA', 'UAARE');

-- CreateEnum
CREATE TYPE "SlotKind" AS ENUM ('LESSON', 'BREAK');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "SchoolGroup" NOT NULL,
    "school" TEXT NOT NULL DEFAULT '',
    "schoolYear" TEXT NOT NULL DEFAULT '',
    "className" TEXT NOT NULL DEFAULT '',
    "includeSaturday" BOOLEAN NOT NULL DEFAULT false,
    "athleteId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "kind" "SlotKind" NOT NULL DEFAULT 'LESSON',
    "label" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "slotId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "room" TEXT NOT NULL DEFAULT '',
    "teacher" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("slotId","weekday")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_athleteId_key" ON "students"("athleteId");

-- CreateIndex
CREATE INDEX "students_group_idx" ON "students"("group");

-- CreateIndex
CREATE INDEX "time_slots_studentId_idx" ON "time_slots"("studentId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

