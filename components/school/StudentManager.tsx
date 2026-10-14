"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteLinkOptions, type LinkableAthlete } from "@/components/school/StudentInfoForm";
import { GROUP_LABELS, studentClassLabel, type StudentDTO } from "@/lib/school/schedule";
import type { SchoolGroup } from "@/app/generated/prisma/enums";

export function StudentManager({
  group,
  students,
  athletes,
  schools,
}: {
  group: SchoolGroup;
  students: StudentDTO[];
  athletes: LinkableAthlete[];
  schools: string[];
}) {
  const router = useRouter();
  const [athleteId, setAthleteId] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickAthlete(id: string) {
    setAthleteId(id);
    const athlete = athletes.find((a) => a.id === id);
    if (athlete && !name.trim()) setName(athlete.name);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          group,
          school,
          schoolYear,
          className,
          athleteId: athleteId || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Não foi possível criar o aluno.");
        return;
      }
      const created: StudentDTO = await res.json();
      router.push(`/school/students/${created.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="panel">
        <h2>Novo aluno · {GROUP_LABELS[group]}</h2>
        <form onSubmit={handleCreate}>
          <label className="field" htmlFor="new-athlete">
            Atleta existente (opcional)
          </label>
          <select id="new-athlete" value={athleteId} onChange={(e) => pickAthlete(e.target.value)}>
            <AthleteLinkOptions athletes={athletes} />
          </select>

          <label className="field" htmlFor="new-name" style={{ marginTop: 10 }}>
            Nome
          </label>
          <input
            id="new-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="João Silva"
          />

          <label className="field" htmlFor="new-school" style={{ marginTop: 10 }}>
            Escola
          </label>
          <input
            id="new-school"
            type="text"
            list="new-school-suggestions"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Escola Secundária…"
          />
          <datalist id="new-school-suggestions">
            {schools.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <div>
              <label className="field" htmlFor="new-year">
                Ano
              </label>
              <input
                id="new-year"
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="10.º"
              />
            </div>
            <div>
              <label className="field" htmlFor="new-class">
                Turma
              </label>
              <input
                id="new-class"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="B"
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}
          <div className="row">
            <button type="submit" className="primary" disabled={creating || !name.trim()}>
              Criar aluno
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Alunos ({students.length})</h2>
        {students.length === 0 && <p className="hint">Ainda sem alunos neste grupo.</p>}
        <ul className="list-plain">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                href={`/school/students/${s.id}`}
                style={{ flex: 1, display: "flex", flexDirection: "column", textDecoration: "none" }}
              >
                <span>
                  {s.name}
                  {s.athleteTeamName && (
                    <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                      {" "}
                      · {s.athleteTeamName}
                    </span>
                  )}
                </span>
                <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  {[s.school, studentClassLabel(s)].filter(Boolean).join(" · ") || "Sem escola definida"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
