import type { SchoolGroup, SlotKind } from "@/app/generated/prisma/enums";

export type GroupSlug = "pousada" | "uaare";

export const GROUP_SLUGS: GroupSlug[] = ["pousada", "uaare"];

export const GROUP_BY_SLUG: Record<GroupSlug, SchoolGroup> = {
  pousada: "POUSADA",
  uaare: "UAARE",
};

export const SLUG_BY_GROUP: Record<SchoolGroup, GroupSlug> = {
  POUSADA: "pousada",
  UAARE: "uaare",
};

export const GROUP_LABELS: Record<SchoolGroup, string> = {
  POUSADA: "Pousada",
  UAARE: "UAARE",
};

export function isGroupSlug(value: string): value is GroupSlug {
  return GROUP_SLUGS.includes(value as GroupSlug);
}

export function isSchoolGroup(value: unknown): value is SchoolGroup {
  return value === "POUSADA" || value === "UAARE";
}

/** 1 = segunda … 6 = sábado (sábado só aparece quando o aluno o tem ativo). */
export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

export const WEEKDAY_SHORT: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export function weekdaysFor(includeSaturday: boolean): number[] {
  return includeSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
}

export function isWeekday(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 6;
}

export type LessonDTO = { subject: string; room: string; teacher: string };

export type SlotDTO = {
  id: string;
  startMin: number;
  endMin: number;
  kind: SlotKind;
  label: string;
  lessons: Record<number, LessonDTO>; // weekday -> aula
};

export type StudentDTO = {
  id: string;
  name: string;
  group: SchoolGroup;
  school: string;
  schoolYear: string;
  className: string;
  includeSaturday: boolean;
  athleteId: string | null;
  athleteTeamName: string | null;
};

export type StudentScheduleDTO = StudentDTO & { slots: SlotDTO[] };

export function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "8:15", "08:15" ou "08h15" → minutos desde as 00:00; null se inválido. */
export function parseTime(value: string): number | null {
  const match = /^\s*(\d{1,2})\s*[:hH.]\s*(\d{2})\s*$/.exec(value);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function formatRange(start: number, end: number): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

export function studentClassLabel(s: Pick<StudentDTO, "schoolYear" | "className">): string {
  return [s.schoolYear, s.className].filter(Boolean).join(" ");
}

function sameLesson(a: LessonDTO | undefined, b: LessonDTO | undefined): boolean {
  return !!a && !!b && a.subject === b.subject && a.room === b.room && a.teacher === b.teacher;
}

/** Duas aulas seguidas só se juntam quando não há mais de 10 min entre elas
 * (troca de sala) — um intervalo maior é um intervalo a sério. */
const MERGE_GAP_MIN = 10;

/** Para cada slot e dia, quantas linhas a célula ocupa na grelha só de leitura:
 * aulas iguais em blocos seguidos (ex.: aula de 90 min = 2 blocos de 45) juntam-se
 * numa só célula. 0 = célula absorvida pela de cima. */
export function computeRowSpans(slots: SlotDTO[], weekday: number): number[] {
  const spans = slots.map(() => 1);
  let anchor = -1;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const lesson = slot.kind === "LESSON" ? slot.lessons[weekday] : undefined;
    const prev = anchor >= 0 ? slots[i - 1] : undefined;
    if (
      lesson &&
      prev &&
      prev.kind === "LESSON" &&
      slot.startMin - prev.endMin <= MERGE_GAP_MIN &&
      sameLesson(slots[anchor].lessons[weekday], lesson)
    ) {
      spans[anchor] += 1;
      spans[i] = 0;
    } else {
      anchor = lesson ? i : -1;
    }
  }
  return spans;
}

/** True se a aula deste slot continua a do slot anterior (usado na grelha
 * editável, onde as células não se juntam mas ficam visualmente ligadas). */
export function continuesPrevious(slots: SlotDTO[], index: number, weekday: number): boolean {
  if (index === 0) return false;
  const slot = slots[index];
  const prev = slots[index - 1];
  return (
    slot.kind === "LESSON" &&
    prev.kind === "LESSON" &&
    slot.startMin - prev.endMin <= MERGE_GAP_MIN &&
    sameLesson(prev.lessons[weekday], slot.lessons[weekday])
  );
}

/** Intervalos com aulas num dia, com aulas seguidas fundidas (para as barras). */
export function dayIntervals(slots: SlotDTO[], weekday: number): { start: number; end: number }[] {
  const intervals: { start: number; end: number }[] = [];
  for (const slot of slots) {
    if (slot.kind !== "LESSON" || !slot.lessons[weekday]) continue;
    const last = intervals[intervals.length - 1];
    if (last && slot.startMin - last.end <= MERGE_GAP_MIN) {
      last.end = Math.max(last.end, slot.endMin);
    } else {
      intervals.push({ start: slot.startMin, end: slot.endMin });
    }
  }
  return intervals;
}

/** Entrada (primeira aula) e saída (última aula) num dia; null se não tem aulas. */
export function daySpan(slots: SlotDTO[], weekday: number): { start: number; end: number } | null {
  const intervals = dayIntervals(slots, weekday);
  if (intervals.length === 0) return null;
  return { start: intervals[0].start, end: intervals[intervals.length - 1].end };
}

/** Entrada mais cedo e saída mais tarde de um conjunto de alunos num dia,
 * para destacar os extremos na vista de grupo. */
export function dayExtremes(
  spans: ({ start: number; end: number } | null)[]
): { earliest: number | null; latest: number | null } {
  let earliest: number | null = null;
  let latest: number | null = null;
  for (const s of spans) {
    if (!s) continue;
    if (earliest === null || s.start < earliest) earliest = s.start;
    if (latest === null || s.end > latest) latest = s.end;
  }
  return { earliest, latest };
}
