import Link from "next/link";
import { listMeetings } from "@/lib/data/schoolMeetings";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  GROUP_BY_SLUG,
  GROUP_LABELS,
  SLUG_BY_GROUP,
  isGroupSlug,
  type GroupSlug,
} from "@/lib/school/schedule";
import { formatMeetingDate, parseDateOnly } from "@/lib/school/meetings";

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function SchoolMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const groupSlug = first(sp.group);
  const group = isGroupSlug(groupSlug) ? GROUP_BY_SLUG[groupSlug as GroupSlug] : undefined;
  const studentQuery = first(sp.q).trim();
  const from = first(sp.from);
  const to = first(sp.to);

  const meetings = await listMeetings({
    group,
    studentQuery: studentQuery || undefined,
    from: from ? (parseDateOnly(from) ?? undefined) : undefined,
    to: to ? (parseDateOnly(to) ?? undefined) : undefined,
  });

  const newHref = `/school/meetings/new${group ? `?group=${SLUG_BY_GROUP[group]}` : ""}`;

  return (
    <>
      <PageHeader
        title="Reuniões escolares"
        subtitle="Registo de reuniões com as escolas, por grupo e por data."
        actions={
          <Link href={newHref}>
            <button type="button" className="primary">
              Nova reunião
            </button>
          </Link>
        }
      />
      <div className="panel">
        <form className="section-filters" method="get">
          <div>
            <label className="field" htmlFor="mf-group">
              Grupo
            </label>
            <select id="mf-group" name="group" defaultValue={groupSlug}>
              <option value="">Todos</option>
              <option value="pousada">{GROUP_LABELS.POUSADA}</option>
              <option value="uaare">{GROUP_LABELS.UAARE}</option>
            </select>
          </div>
          <div>
            <label className="field" htmlFor="mf-q">
              Aluno
            </label>
            <input id="mf-q" type="text" name="q" defaultValue={studentQuery} placeholder="Nome do aluno" />
          </div>
          <div>
            <label className="field" htmlFor="mf-from">
              De
            </label>
            <input id="mf-from" type="date" name="from" defaultValue={from} />
          </div>
          <div>
            <label className="field" htmlFor="mf-to">
              Até
            </label>
            <input id="mf-to" type="date" name="to" defaultValue={to} />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button type="submit">Filtrar</button>
          </div>
        </form>

        {meetings.length === 0 && <p className="empty">Nenhuma reunião encontrada.</p>}
        {meetings.length > 0 && (
          <ul className="list-plain">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/school/meetings/${m.id}`}
                  style={{ flex: 1, display: "flex", flexDirection: "column", textDecoration: "none" }}
                >
                  <span>
                    {formatMeetingDate(m.date)}
                    <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                      {" "}
                      · {GROUP_LABELS[m.group]}
                    </span>
                  </span>
                  <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {[m.school, m.withWhom].filter(Boolean).join(" · ") || "Sem detalhes"} · {m.studentCount}{" "}
                    aluno{m.studentCount === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
