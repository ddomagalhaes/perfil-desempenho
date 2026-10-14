import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStudentSchedule,
  listAthletesForStudentLinking,
  listStudents,
} from "@/lib/data/students";
import { PageHeader } from "@/components/layout/PageHeader";
import { StudentInfoForm } from "@/components/school/StudentInfoForm";
import { CopySchedulePanel } from "@/components/school/CopySchedulePanel";
import { SlotEditor } from "@/components/school/SlotEditor";
import { ScheduleEditor } from "@/components/school/ScheduleEditor";
import { GROUP_LABELS, SLUG_BY_GROUP, studentClassLabel } from "@/lib/school/schedule";

export const dynamic = "force-dynamic";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const [student, athletes, allStudents] = await Promise.all([
    getStudentSchedule(studentId),
    listAthletesForStudentLinking(),
    listStudents(),
  ]);
  if (!student) notFound();

  const schools = [...new Set(allStudents.map((s) => s.school).filter(Boolean))].sort();
  const others = allStudents.filter((s) => s.id !== student.id);
  const subtitle = [
    GROUP_LABELS[student.group],
    student.school,
    studentClassLabel(student),
    student.athleteTeamName ? `atleta em ${student.athleteTeamName}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <nav className="breadcrumbs">
        <Link href={`/school/groups/${SLUG_BY_GROUP[student.group]}`}>
          ← {GROUP_LABELS[student.group]}
        </Link>
      </nav>
      <PageHeader
        title={student.name}
        subtitle={subtitle}
        actions={
          <a href={`/print/school/student/${student.id}`} target="_blank" rel="noopener noreferrer">
            <button type="button">Exportar PDF</button>
          </a>
        }
      />
      <div className="layout">
        <div>
          <StudentInfoForm key={student.id} student={student} athletes={athletes} schools={schools} />
          <SlotEditor studentId={student.id} slots={student.slots} />
          <CopySchedulePanel
            student={student}
            others={others}
            hasSchedule={student.slots.length > 0}
          />
        </div>
        <div className="panel">
          <h2>Horário semanal</h2>
          <ScheduleEditor
            studentId={student.id}
            slots={student.slots}
            includeSaturday={student.includeSaturday}
          />
        </div>
      </div>
    </>
  );
}
