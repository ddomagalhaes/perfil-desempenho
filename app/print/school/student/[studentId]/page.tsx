import { notFound } from "next/navigation";
import { getStudentSchedule } from "@/lib/data/students";
import { PrintButton } from "@/components/print/PrintButton";
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
      <h1>{student.name}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Horário escolar — {meta} — gerado em {new Date().toLocaleDateString("pt-PT")}
      </p>
      <ScheduleGrid slots={student.slots} includeSaturday={student.includeSaturday} />
    </div>
  );
}
