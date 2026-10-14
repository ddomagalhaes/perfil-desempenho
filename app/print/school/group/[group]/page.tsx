import { notFound } from "next/navigation";
import { listGroupSchedules } from "@/lib/data/students";
import { PrintButton } from "@/components/print/PrintButton";
import {
  ExtremesLegend,
  GroupDayTimeline,
  GroupWeekTable,
} from "@/components/school/GroupSummaries";
import { GROUP_BY_SLUG, GROUP_LABELS, isGroupSlug, WEEKDAY_LABELS } from "@/lib/school/schedule";
import { parseGroupView, type GroupViewParams } from "@/lib/school/view";

export const dynamic = "force-dynamic";

const SORT_LABELS = {
  start: "ordenado por entrada",
  end: "ordenado por saída",
  name: "ordenado por nome",
} as const;

export default async function PrintSchoolGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string }>;
  searchParams: Promise<GroupViewParams>;
}) {
  const { group: slug } = await params;
  if (!isGroupSlug(slug)) notFound();
  const group = GROUP_BY_SLUG[slug];

  const students = await listGroupSchedules(group);
  const v = parseGroupView(await searchParams, students);
  const scope =
    v.view === "day" ? `${WEEKDAY_LABELS[v.day]} — ${SORT_LABELS[v.sort]}` : "resumo semanal";

  return (
    <div>
      <PrintButton />
      <h1>{GROUP_LABELS[group]}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        {students.length} aluno{students.length === 1 ? "" : "s"} — {scope} — gerado em{" "}
        {new Date().toLocaleDateString("pt-PT")}
      </p>
      {v.view === "day" ? (
        <GroupDayTimeline students={students} weekday={v.day} sort={v.sort} linkStudents={false} />
      ) : (
        <GroupWeekTable students={students} days={v.days} linkStudents={false} />
      )}
      {students.length > 0 && <ExtremesLegend />}
    </div>
  );
}
