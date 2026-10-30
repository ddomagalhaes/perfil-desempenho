import { notFound } from "next/navigation";
import { getStudentSchedule } from "@/lib/data/students";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";
import { ScheduleGrid } from "@/components/school/ScheduleGrid";
import { GROUP_LABELS, studentClassLabel } from "@/lib/school/schedule";

export const dynamic = "force-dynamic";

export default async function PrintStudentSchedulePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudentSchedule(studentId);
  if (!student) notFound();

  const meta = [GROUP_LABELS[student.group], student.school, studentClassLabel(student)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <PrintButton />
      <PrintHeader eyebrow="Escolar · Horário" title={student.name} subtitle={meta} />
      <ScheduleGrid slots={student.slots} includeSaturday={student.includeSaturday} />
      <PrintFooter />
    </div>
  );
}
