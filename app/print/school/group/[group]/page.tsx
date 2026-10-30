import { notFound } from "next/navigation";
import { listGroupSchedules } from "@/lib/data/students";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";
import {
  ExtremesLegend,
  GroupDayTimeline,
  GroupWeekTable,
  SchoolRoster,
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
  if (group === "UAARE") {
    return (
      <div>
        <PrintButton />
        <PrintHeader
          eyebrow="Escolar · Grupo"
          title={GROUP_LABELS[group]}
          subtitle={`${students.length} aluno${students.length === 1 ? "" : "s"} — por escola`}
        />
        <SchoolRoster students={students} linkStudents={false} />
        <PrintFooter />
      </div>
    );
  }

  const scope =
    v.view === "day" ? `${WEEKDAY_LABELS[v.day]} — ${SORT_LABELS[v.sort]}` : "resumo semanal";

  return (
    <div>
      <PrintButton />
      <PrintHeader
        eyebrow="Escolar · Grupo"
        title={GROUP_LABELS[group]}
        subtitle={`${students.length} aluno${students.length === 1 ? "" : "s"} — ${scope}`}
      />
      {v.view === "day" ? (
        <GroupDayTimeline students={students} weekday={v.day} sort={v.sort} linkStudents={false} />
      ) : (
        <GroupWeekTable students={students} days={v.days} linkStudents={false} />
      )}
      {students.length > 0 && <ExtremesLegend />}
      <PrintFooter />
    </div>
  );
}
