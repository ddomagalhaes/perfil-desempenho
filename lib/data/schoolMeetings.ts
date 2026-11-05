import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { SchoolGroup } from "@/app/generated/prisma/enums";
import {
  toDateOnly,
  type SchoolMeetingDetailDTO,
  type SchoolMeetingDTO,
  type StudentMeetingTimelineEntryDTO,
} from "@/lib/school/meetings";

type MeetingRow = {
  id: string;
  date: Date;
  group: SchoolGroup;
  school: string;
  withWhom: string;
  note: string;
  _count: { studentNotes: number };
};

function toMeetingDTO(row: MeetingRow): SchoolMeetingDTO {
  return {
    id: row.id,
    date: toDateOnly(row.date),
    group: row.group,
    school: row.school,
    withWhom: row.withWhom,
    note: row.note,
    studentCount: row._count.studentNotes,
  };
}

export type MeetingFilters = {
  group?: SchoolGroup;
  studentQuery?: string;
  from?: Date;
  to?: Date;
};

export async function listMeetings(filters: MeetingFilters = {}): Promise<SchoolMeetingDTO[]> {
  const rows = await prisma.schoolMeeting.findMany({
    where: {
      ...(filters.group ? { group: filters.group } : {}),
      ...(filters.from || filters.to
        ? { date: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
        : {}),
      ...(filters.studentQuery
        ? { studentNotes: { some: { student: { name: { contains: filters.studentQuery, mode: "insensitive" } } } } }
        : {}),
    },
    orderBy: { date: "desc" },
    include: { _count: { select: { studentNotes: true } } },
  });
  return rows.map(toMeetingDTO);
}

export async function getMeetingDetail(id: string): Promise<SchoolMeetingDetailDTO | null> {
  const row = await prisma.schoolMeeting.findUnique({
    where: { id },
    include: {
      _count: { select: { studentNotes: true } },
      studentNotes: {
        include: { student: { select: { id: true, name: true } } },
        orderBy: { student: { name: "asc" } },
      },
    },
  });
  if (!row) return null;
  return {
    ...toMeetingDTO(row),
    notes: row.studentNotes.map((n) => ({
      studentId: n.student.id,
      studentName: n.student.name,
      note: n.note,
    })),
  };
}

export type MeetingInput = {
  date: Date;
  group: SchoolGroup;
  school: string;
  withWhom: string;
  note: string;
  studentNotes: { studentId: string; note: string }[];
};

function nonEmptyNotes(studentNotes: { studentId: string; note: string }[]) {
  return studentNotes.map((n) => ({ ...n, note: n.note.trim() })).filter((n) => n.note);
}

export async function createMeeting(input: MeetingInput): Promise<SchoolMeetingDetailDTO> {
  const notes = nonEmptyNotes(input.studentNotes);
  const created = await prisma.schoolMeeting.create({
    data: {
      date: input.date,
      group: input.group,
      school: input.school.trim(),
      withWhom: input.withWhom.trim(),
      note: input.note.trim(),
      studentNotes: { create: notes.map((n) => ({ studentId: n.studentId, note: n.note })) },
    },
  });
  const detail = await getMeetingDetail(created.id);
  if (!detail) throw new Error("Falha ao criar a reunião.");
  return detail;
}

export type MeetingUpdateInput = Partial<Omit<MeetingInput, "studentNotes">> & {
  studentNotes?: { studentId: string; note: string }[];
};

/** Atualiza os metadados da reunião e, se vierem notas, substitui o conjunto
 * completo: apaga as que deixaram de ter texto, cria/atualiza as restantes. */
export async function updateMeeting(id: string, input: MeetingUpdateInput): Promise<SchoolMeetingDetailDTO> {
  await prisma.$transaction(async (tx) => {
    await tx.schoolMeeting.update({
      where: { id },
      data: {
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.group !== undefined ? { group: input.group } : {}),
        ...(input.school !== undefined ? { school: input.school.trim() } : {}),
        ...(input.withWhom !== undefined ? { withWhom: input.withWhom.trim() } : {}),
        ...(input.note !== undefined ? { note: input.note.trim() } : {}),
      },
    });

    if (input.studentNotes) {
      const notes = nonEmptyNotes(input.studentNotes);
      const keepIds = new Set(notes.map((n) => n.studentId));
      await tx.studentMeetingNote.deleteMany({
        where: { meetingId: id, studentId: { notIn: [...keepIds] } },
      });
      for (const n of notes) {
        await tx.studentMeetingNote.upsert({
          where: { meetingId_studentId: { meetingId: id, studentId: n.studentId } },
          create: { meetingId: id, studentId: n.studentId, note: n.note },
          update: { note: n.note },
        });
      }
    }
  });
  const detail = await getMeetingDetail(id);
  if (!detail) throw new Error("Reunião não encontrada.");
  return detail;
}

/** Linha do tempo de notas de um aluno, da mais recente para a mais antiga,
 * para a ficha do aluno. */
export async function listStudentMeetingTimeline(
  studentId: string
): Promise<StudentMeetingTimelineEntryDTO[]> {
  const rows = await prisma.studentMeetingNote.findMany({
    where: { studentId },
    include: { meeting: { select: { id: true, date: true, school: true } } },
    orderBy: { meeting: { date: "desc" } },
  });
  return rows.map((r) => ({
    meetingId: r.meeting.id,
    date: toDateOnly(r.meeting.date),
    school: r.meeting.school,
    note: r.note,
  }));
}
