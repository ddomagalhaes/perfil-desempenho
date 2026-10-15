import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listAthletesForStudentLinking,
  listGroupSchedules,
  listStudents,
} from "@/lib/data/students";
import { PageHeader } from "@/components/layout/PageHeader";
import { StudentManager } from "@/components/school/StudentManager";
import {
  ExtremesLegend,
  GroupDayTimeline,
  GroupWeekTable,
  SchoolRoster,
} from "@/components/school/GroupSummaries";
import {
  GROUP_BY_SLUG,
  GROUP_LABELS,
  isGroupSlug,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
} from "@/lib/school/schedule";
import { groupViewQuery, parseGroupView, type GroupView, type GroupViewParams } from "@/lib/school/view";

export const dynamic = "force-dynamic";

export default async function SchoolGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string }>;
  searchParams: Promise<GroupViewParams>;
}) {
  const { group: slug } = await params;
  if (!isGroupSlug(slug)) notFound();
  const group = GROUP_BY_SLUG[slug];

  const [schedules, athletes, allStudents] = await Promise.all([
    listGroupSchedules(group),
    listAthletesForStudentLinking(),
    listStudents(),
  ]);
  const v = parseGroupView(await searchParams, schedules);
  const schools = [...new Set(allStudents.map((s) => s.school).filter(Boolean))].sort();
  // UAARE não tem horários: basta saber o aluno e a escola.
  const rosterOnly = group === "UAARE";
  const href = (patch: Partial<GroupView>) =>
    `/school/groups/${slug}${groupViewQuery({ ...v, ...patch })}`;

  return (
    <>
      <PageHeader
        title={GROUP_LABELS[group]}
        subtitle={
          group === "POUSADA"
            ? "Alunos-atletas que vivem na pousada."
            : "Alunos-atletas inseridos no projeto UAARE."
        }
        actions={
          <a
            href={`/print/school/group/${slug}${rosterOnly ? "" : groupViewQuery(v)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button">Exportar PDF</button>
          </a>
        }
      />
      <div className="layout">
        <div>
          <StudentManager
            group={group}
            students={schedules}
            athletes={athletes}
            schools={schools}
            showList={!rosterOnly}
          />
        </div>
        {rosterOnly ? (
          <div className="panel">
            <h2>Alunos por escola ({schedules.length})</h2>
            <SchoolRoster students={schedules} />
          </div>
        ) : (
          <div className="panel">
            <h2>Resumo {v.view === "day" ? `· ${WEEKDAY_LABELS[v.day]}` : "da semana"}</h2>
            <div className="toolbar">
              <div className="seg">
                <Link href={href({ view: "day" })} className={v.view === "day" ? "active" : ""}>
                  Dia
                </Link>
                <Link href={href({ view: "week" })} className={v.view === "week" ? "active" : ""}>
                  Semana
                </Link>
              </div>
              {v.view === "day" && (
                <>
                  <div className="seg">
                    {v.days.map((d) => (
                      <Link key={d} href={href({ day: d })} className={v.day === d ? "active" : ""}>
                        {WEEKDAY_SHORT[d]}
                      </Link>
                    ))}
                  </div>
                  <span className="spacer" />
                  <div className="seg">
                    <Link href={href({ sort: "start" })} className={v.sort === "start" ? "active" : ""}>
                      Entrada
                    </Link>
                    <Link href={href({ sort: "end" })} className={v.sort === "end" ? "active" : ""}>
                      Saída
                    </Link>
                    <Link href={href({ sort: "name" })} className={v.sort === "name" ? "active" : ""}>
                      Nome
                    </Link>
                  </div>
                </>
              )}
            </div>
            {v.view === "day" ? (
              <GroupDayTimeline students={schedules} weekday={v.day} sort={v.sort} />
            ) : (
              <GroupWeekTable students={schedules} days={v.days} />
            )}
            {schedules.length > 0 && <ExtremesLegend />}
          </div>
        )}
      </div>
    </>
  );
}
