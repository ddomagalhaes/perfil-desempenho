import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { SchoolGroup, SlotKind } from "@/app/generated/prisma/enums";
import type { SlotDTO, StudentDTO, StudentScheduleDTO } from "@/lib/school/schedule";

const include = {
  athlete: { select: { team: { select: { name: true } } } },
} as const;

const scheduleInclude = {
  ...include,
  slots: { orderBy: { startMin: "asc" }, include: { lessons: true } },
} as const;

type StudentRow = {
  id: string;
  name: string;
  group: SchoolGroup;
  school: string;
  schoolYear: string;
  className: string;
  includeSaturday: boolean;
  athleteId: string | null;
  athlete: { team: { name: string } } | null;
};

type SlotRow = {
  id: string;
  startMin: number;
  endMin: number;
  kind: SlotKind;
  label: string;
  lessons: { weekday: number; subject: string; room: string; teacher: string }[];
};

function toStudentDTO(row: StudentRow): StudentDTO {
  return {
    id: row.id,
    name: row.name,
    group: row.group,
    school: row.school,
    schoolYear: row.schoolYear,
    className: row.className,
    includeSaturday: row.includeSaturday,
    athleteId: row.athleteId,
    athleteTeamName: row.athlete?.team.name ?? null,
  };
}

function toSlotDTO(row: SlotRow): SlotDTO {
  const lessons: SlotDTO["lessons"] = {};
  for (const l of row.lessons) {
    lessons[l.weekday] = { subject: l.subject, room: l.room, teacher: l.teacher };
  }
  return {
    id: row.id,
    startMin: row.startMin,
    endMin: row.endMin,
    kind: row.kind,
    label: row.label,
    lessons,
  };
}

function toScheduleDTO(row: StudentRow & { slots: SlotRow[] }): StudentScheduleDTO {
  return { ...toStudentDTO(row), slots: row.slots.map(toSlotDTO) };
}

const activeOrder = { name: "asc" } as const;

export async function listStudents(group?: SchoolGroup): Promise<StudentDTO[]> {
  const rows = await prisma.student.findMany({
    where: { archivedAt: null, ...(group ? { group } : {}) },
    orderBy: activeOrder,
    include,
  });
  return rows.map(toStudentDTO);
}

/** Horários completos de todos os alunos de um grupo, para a vista de resumo. */
export async function listGroupSchedules(group: SchoolGroup): Promise<StudentScheduleDTO[]> {
  const rows = await prisma.student.findMany({
    where: { archivedAt: null, group },
    orderBy: activeOrder,
    include: scheduleInclude,
  });
  return rows.map(toScheduleDTO);
}

export async function getStudentSchedule(id: string): Promise<StudentScheduleDTO | null> {
  const row = await prisma.student.findFirst({
    where: { id, archivedAt: null },
    include: scheduleInclude,
  });
  return row ? toScheduleDTO(row) : null;
}

/** Todos os atletas das equipas, para o seletor "ligar a atleta existente";
 * marca os que já têm ficha escolar para não se criar uma ligação duplicada. */
export async function listAthletesForStudentLinking(): Promise<
  { id: string; name: string; teamName: string; linkedStudentId: string | null }[]
> {
  const athletes = await prisma.athlete.findMany({
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    include: {
      team: { select: { name: true } },
      student: { select: { id: true, archivedAt: true } },
    },
  });
  return athletes.map((a) => ({
    id: a.id,
    name: a.name,
    teamName: a.team.name,
    linkedStudentId: a.student && !a.student.archivedAt ? a.student.id : null,
  }));
}

export type StudentInput = {
  name?: string;
  group?: SchoolGroup;
  school?: string;
  schoolYear?: string;
  className?: string;
  includeSaturday?: boolean;
  athleteId?: string | null;
};

function studentData(input: StudentInput) {
  return {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.group !== undefined ? { group: input.group } : {}),
    ...(input.school !== undefined ? { school: input.school.trim() } : {}),
    ...(input.schoolYear !== undefined ? { schoolYear: input.schoolYear.trim() } : {}),
    ...(input.className !== undefined ? { className: input.className.trim() } : {}),
    ...(input.includeSaturday !== undefined ? { includeSaturday: input.includeSaturday } : {}),
    ...(input.athleteId !== undefined ? { athleteId: input.athleteId } : {}),
  };
}

/** Liberta o atleta de uma ficha arquivada, para poder voltar a ser ligado. */
async function releaseArchivedLink(athleteId: string | null | undefined) {
  if (!athleteId) return;
  await prisma.student.updateMany({
    where: { athleteId, archivedAt: { not: null } },
    data: { athleteId: null },
  });
}

export async function createStudent(
  input: StudentInput & { name: string; group: SchoolGroup }
): Promise<StudentDTO> {
  await releaseArchivedLink(input.athleteId);
  const created = await prisma.student.create({
    data: { ...studentData(input), name: input.name.trim(), group: input.group },
    include,
  });
  return toStudentDTO(created);
}

export async function updateStudent(id: string, input: StudentInput): Promise<StudentDTO> {
  await releaseArchivedLink(input.athleteId);
  const updated = await prisma.student.update({
    where: { id },
    data: studentData(input),
    include,
  });
  return toStudentDTO(updated);
}

export async function archiveStudent(id: string): Promise<void> {
  await prisma.student.update({
    where: { id },
    data: { archivedAt: new Date(), athleteId: null },
  });
}

export type SlotInput = {
  id?: string;
  startMin: number;
  endMin: number;
  kind: SlotKind;
  label: string;
};

/** Substitui a lista de blocos do aluno. Blocos com id existente são atualizados
 * (mantêm as aulas); os que desaparecem da lista são apagados com as suas aulas. */
export async function replaceSlots(studentId: string, slots: SlotInput[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.timeSlot.findMany({ where: { studentId }, select: { id: true } });
    const existingIds = new Set(existing.map((s) => s.id));
    const keptIds = new Set(slots.map((s) => s.id).filter((id): id is string => !!id && existingIds.has(id)));

    await tx.timeSlot.deleteMany({
      where: { studentId, id: { notIn: [...keptIds] } },
    });

    for (const slot of slots) {
      const data = {
        startMin: slot.startMin,
        endMin: slot.endMin,
        kind: slot.kind,
        label: slot.kind === "BREAK" ? slot.label.trim() : "",
      };
      if (slot.id && keptIds.has(slot.id)) {
        await tx.timeSlot.update({ where: { id: slot.id }, data });
        // Um bloco que passou a intervalo deixa de ter aulas.
        if (slot.kind === "BREAK") await tx.lesson.deleteMany({ where: { slotId: slot.id } });
      } else {
        await tx.timeSlot.create({ data: { ...data, studentId } });
      }
    }
  });
}

/** Guarda (ou limpa, se a disciplina vier vazia) a aula de um bloco num dia. */
export async function setLesson(
  studentId: string,
  slotId: string,
  weekday: number,
  lesson: { subject: string; room: string; teacher: string }
): Promise<boolean> {
  const slot = await prisma.timeSlot.findFirst({ where: { id: slotId, studentId } });
  if (!slot || slot.kind !== "LESSON") return false;

  const subject = lesson.subject.trim();
  if (!subject) {
    await prisma.lesson.deleteMany({ where: { slotId, weekday } });
    return true;
  }

  const data = { subject, room: lesson.room.trim(), teacher: lesson.teacher.trim() };
  await prisma.lesson.upsert({
    where: { slotId_weekday: { slotId, weekday } },
    create: { slotId, weekday, ...data },
    update: data,
  });
  return true;
}

/** Copia o horário completo (blocos, aulas e sábado) de um aluno para outro,
 * substituindo o que o aluno de destino tinha. */
export async function copySchedule(fromStudentId: string, toStudentId: string): Promise<boolean> {
  if (fromStudentId === toStudentId) return false;
  const source = await prisma.student.findFirst({
    where: { id: fromStudentId, archivedAt: null },
    include: { slots: { include: { lessons: true } } },
  });
  if (!source) return false;

  await prisma.$transaction(async (tx) => {
    await tx.timeSlot.deleteMany({ where: { studentId: toStudentId } });
    await tx.student.update({
      where: { id: toStudentId },
      data: { includeSaturday: source.includeSaturday },
    });
    for (const slot of source.slots) {
      await tx.timeSlot.create({
        data: {
          studentId: toStudentId,
          startMin: slot.startMin,
          endMin: slot.endMin,
          kind: slot.kind,
          label: slot.label,
          lessons: {
            create: slot.lessons.map((l) => ({
              weekday: l.weekday,
              subject: l.subject,
              room: l.room,
              teacher: l.teacher,
            })),
          },
        },
      });
    }
  });
  return true;
}
