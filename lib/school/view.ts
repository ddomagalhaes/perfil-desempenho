import type { DaySort } from "@/components/school/GroupSummaries";
import { weekdaysFor, type StudentScheduleDTO } from "@/lib/school/schedule";

export type GroupViewParams = { view?: string; day?: string; sort?: string };

export type GroupView = { view: "day" | "week"; day: number; sort: DaySort; days: number[] };

/** Lê ?view=day|week&day=1..6&sort=start|end|name. Sem dia escolhido, usa o dia
 * de hoje (ou segunda ao domingo). Sábado só aparece se algum aluno o tiver. */
export function parseGroupView(params: GroupViewParams, students: StudentScheduleDTO[]): GroupView {
  const days = weekdaysFor(students.some((s) => s.includeSaturday));
  const today = new Date().getDay();
  const requested = Number(params.day);
  const day = days.includes(requested) ? requested : days.includes(today) ? today : 1;
  const sort: DaySort = params.sort === "end" || params.sort === "name" ? params.sort : "start";
  return { view: params.view === "week" ? "week" : "day", day, sort, days };
}

export function groupViewQuery(v: Pick<GroupView, "view" | "day" | "sort">): string {
  return v.view === "week" ? "?view=week" : `?view=day&day=${v.day}&sort=${v.sort}`;
}
