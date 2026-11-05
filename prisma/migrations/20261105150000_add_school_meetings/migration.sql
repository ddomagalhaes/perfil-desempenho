-- CreateTable
CREATE TABLE "school_meetings" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "group" "SchoolGroup" NOT NULL,
    "school" TEXT NOT NULL DEFAULT '',
    "withWhom" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_meeting_notes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_meeting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_meetings_group_date_idx" ON "school_meetings"("group", "date");

-- CreateIndex
CREATE INDEX "student_meeting_notes_studentId_idx" ON "student_meeting_notes"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_meeting_notes_meetingId_studentId_key" ON "student_meeting_notes"("meetingId", "studentId");

-- AddForeignKey
ALTER TABLE "student_meeting_notes" ADD CONSTRAINT "student_meeting_notes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "school_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_meeting_notes" ADD CONSTRAINT "student_meeting_notes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

