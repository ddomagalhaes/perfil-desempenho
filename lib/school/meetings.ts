import type { SchoolGroup } from "@/app/generated/prisma/enums";

export type SchoolMeetingDTO = {
  id: string;
  date: string; // yyyy-mm-dd
  group: SchoolGroup;
  school: string;
  withWhom: string;
  note: string;
  studentCount: number;
};

export type StudentMeetingNoteDTO = {
  studentId: string;
  studentName: string;
  note: string;
};

export type SchoolMeetingDetailDTO = SchoolMeetingDTO & {
  notes: StudentMeetingNoteDTO[];
};

export type StudentMeetingTimelineEntryDTO = {
  meetingId: string;
  date: string;
  school: string;
  note: string;
};

/** yyyy-mm-dd, sem fuso horário — a reunião é só uma data, não um instante. */
export function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMeetingDate(value: string): string {
  const d = parseDateOnly(value);
  if (!d) return value;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}
