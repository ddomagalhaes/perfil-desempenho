import Link from "next/link";
import {
  dayExtremes,
  dayIntervals,
  daySpan,
  formatRange,
  formatTime,
  studentClassLabel,
  WEEKDAY_SHORT,
  type StudentDTO,
  type StudentScheduleDTO,
} from "@/lib/school/schedule";

export type DaySort = "start" | "end" | "name";

function SpanText({
  span,
  earliest,
  latest,
}: {
  span: { start: number; end: number } | null;
  earliest: number | null;
  latest: number | null;
}) {
  if (!span) return <span className="muted">sem aulas</span>;
  return (
    <>
      <span className={span.start === earliest ? "early" : undefined}>{formatTime(span.start)}</span>–
      <span className={span.end === latest ? "late" : undefined}>{formatTime(span.end)}</span>
    </>
  );
}

export function ExtremesLegend() {
  return (
    <p className="hint">
      <span className="early">Verde</span>: entrada mais cedo do dia · <span className="late">Laranja</span>:
      saída mais tarde do dia.
    </p>
  );
}

/** Vista do dia: uma linha por aluno com as aulas como barras num eixo de horas. */
export function GroupDayTimeline({
  students,
  weekday,
  sort,
  linkStudents = true,
}: {
  students: StudentScheduleDTO[];
  weekday: number;
  sort: DaySort;
  linkStudents?: boolean;
}) {
  if (students.length === 0) return <p className="empty">Sem alunos neste grupo.</p>;

  const rows = students.map((s) => {
    const active = weekday !== 6 || s.includeSaturday;
    return {
      student: s,
      span: active ? daySpan(s.slots, weekday) : null,
      intervals: active ? dayIntervals(s.slots, weekday) : [],
    };
  });
  const withClasses = rows.filter((r) => r.span);
  const without = rows.filter((r) => !r.span);

  withClasses.sort((a, b) => {
    if (sort === "end") return b.span!.end - a.span!.end || a.span!.start - b.span!.start;
    if (sort === "name") return a.student.name.localeCompare(b.student.name, "pt");
    return a.span!.start - b.span!.start || a.span!.end - b.span!.end;
  });

  const { earliest, latest } = dayExtremes(rows.map((r) => r.span));
  const axisStart = earliest !== null ? Math.floor(earliest / 60) * 60 : 8 * 60;
  const axisEnd = latest !== null ? Math.max(Math.ceil(latest / 60) * 60, axisStart + 60) : 18 * 60;
  const total = axisEnd - axisStart;
  const pct = (min: number) => `${((min - axisStart) / total) * 100}%`;
  const hours: number[] = [];
  for (let h = axisStart; h <= axisEnd; h += 60) hours.push(h);

  const nameCell = (s: StudentScheduleDTO) => {
    const cls = studentClassLabel(s);
    const content = (
      <>
        {s.name}
        {cls && <small>{cls}</small>}
      </>
    );
    return linkStudents ? (
      <Link className="tl-name" href={`/school/students/${s.id}`}>
        {content}
      </Link>
    ) : (
      <span className="tl-name">{content}</span>
    );
  };

  return (
    <div className="tl">
      <div className="tl-row" style={{ borderTop: "none" }}>
        <span />
        <div className="tl-axis">
          {hours.map((h) => (
            <span key={h} style={{ left: pct(h) }}>
              {String(h / 60).padStart(2, "0")}h
            </span>
          ))}
        </div>
        <span className="muted" style={{ textAlign: "right", fontSize: 11 }}>
          Entrada–saída
        </span>
      </div>
      {withClasses.map(({ student, span, intervals }) => (
        <div className="tl-row" key={student.id}>
          {nameCell(student)}
          <div className="tl-track">
            {hours.map((h) => (
              <div key={h} className="tl-tick" style={{ left: pct(h) }} />
            ))}
            {intervals.map((iv) => (
              <div
                key={iv.start}
                className="tl-bar"
                style={{ left: pct(iv.start), width: `${((iv.end - iv.start) / total) * 100}%` }}
                title={formatRange(iv.start, iv.end)}
              />
            ))}
          </div>
          <span className="tl-range">
            <SpanText span={span} earliest={earliest} latest={latest} />
          </span>
        </div>
      ))}
      {without.map(({ student }) => (
        <div className="tl-row" key={student.id}>
          {nameCell(student)}
          <div className="tl-track" />
          <span className="tl-range muted">sem aulas</span>
        </div>
      ))}
    </div>
  );
}

/** Vista da semana: entrada–saída de cada aluno em cada dia, com os extremos
 * de cada dia destacados. */
export function GroupWeekTable({
  students,
  days,
  linkStudents = true,
}: {
  students: StudentScheduleDTO[];
  days: number[];
  linkStudents?: boolean;
}) {
  if (students.length === 0) return <p className="empty">Sem alunos neste grupo.</p>;

  const spans = students.map((s) =>
    days.map((d) => (d !== 6 || s.includeSaturday ? daySpan(s.slots, d) : null))
  );
  const extremes = days.map((_, di) => dayExtremes(spans.map((row) => row[di])));

  return (
    <table className="week" style={{ marginTop: 0 }}>
      <thead>
        <tr>
          <th>Aluno</th>
          {days.map((d) => (
            <th key={d}>{WEEKDAY_SHORT[d]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.map((s, si) => (
          <tr key={s.id}>
            <td>
              {linkStudents ? <Link href={`/school/students/${s.id}`}>{s.name}</Link> : s.name}
              {studentClassLabel(s) && <span className="muted"> · {studentClassLabel(s)}</span>}
            </td>
            {days.map((d, di) => (
              <td key={d}>
                {s.includeSaturday || d !== 6 ? (
                  <SpanText span={spans[si][di]} earliest={extremes[di].earliest} latest={extremes[di].latest} />
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Lista simples aluno + escola, agrupada por escola — para grupos sem horários
 * (UAARE), onde o resumo de entradas/saídas não diz nada. */
export function SchoolRoster({
  students,
  linkStudents = true,
}: {
  students: StudentDTO[];
  linkStudents?: boolean;
}) {
  if (students.length === 0) return <p className="empty">Sem alunos neste grupo.</p>;

  const bySchool = new Map<string, StudentDTO[]>();
  for (const s of students) {
    const key = s.school || "Sem escola definida";
    if (!bySchool.has(key)) bySchool.set(key, []);
    bySchool.get(key)!.push(s);
  }
  const schools = [...bySchool.keys()].sort((a, b) => a.localeCompare(b, "pt"));

  return (
    <table className="roster" style={{ marginTop: 0 }}>
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Escola</th>
        </tr>
      </thead>
      <tbody>
        {schools.flatMap((school) =>
          bySchool
            .get(school)!
            .sort((a, b) => a.name.localeCompare(b.name, "pt"))
            .map((s, i, list) => (
              <tr key={s.id}>
                <td>{linkStudents ? <Link href={`/school/students/${s.id}`}>{s.name}</Link> : s.name}</td>
                {i === 0 && (
                  <td rowSpan={list.length} className="school">
                    {school}
                  </td>
                )}
              </tr>
            ))
        )}
      </tbody>
    </table>
  );
}
