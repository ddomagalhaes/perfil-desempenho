import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetingDetail } from "@/lib/data/schoolMeetings";
import { listGroupSchedules } from "@/lib/data/students";
import { PageHeader } from "@/components/layout/PageHeader";
import { MeetingForm, type RosterEntry } from "@/components/school/MeetingForm";
import { GROUP_LABELS, scheduleHint, studentClassLabel } from "@/lib/school/schedule";
import { formatMeetingDate } from "@/lib/school/meetings";

export const dynamic = "force-dynamic";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  const meeting = await getMeetingDetail(meetingId);
  if (!meeting) notFound();

  const schedules = await listGroupSchedules(meeting.group);
  const roster: RosterEntry[] = schedules.map((s) => ({
    id: s.id,
    name: s.name,
    school: s.school,
    classLabel: studentClassLabel(s),
    scheduleHint: scheduleHint(s.slots),
  }));
  const initialNotes = Object.fromEntries(meeting.notes.map((n) => [n.studentId, n.note]));

  return (
    <>
      <nav className="breadcrumbs">
        <Link href="/school/meetings">← Reuniões escolares</Link>
      </nav>
      <PageHeader title={`Reunião · ${GROUP_LABELS[meeting.group]}`} subtitle={formatMeetingDate(meeting.date)} />
      <MeetingForm
        key={meeting.id}
        mode="edit"
        meeting={meeting}
        group={meeting.group}
        roster={roster}
        initialNotes={initialNotes}
      />
    </>
  );
}
