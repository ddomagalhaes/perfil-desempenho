"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { GROUP_LABELS, SLUG_BY_GROUP, type StudentDTO } from "@/lib/school/schedule";
import type { SchoolGroup } from "@/app/generated/prisma/enums";

export type LinkableAthlete = {
  id: string;
  name: string;
  teamName: string;
  linkedStudentId: string | null;
};

export function AthleteLinkOptions({
  athletes,
  currentStudentId,
}: {
  athletes: LinkableAthlete[];
  currentStudentId?: string;
}) {
  return (
    <>
      <option value="">Sem ligação (registo independente)</option>
      {athletes
        .filter((a) => !a.linkedStudentId || a.linkedStudentId === currentStudentId)
        .map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.teamName})
          </option>
        ))}
    </>
  );
}

export function StudentInfoForm({
  student,
  athletes,
  schools,
}: {
  student: StudentDTO;
  athletes: LinkableAthlete[];
  schools: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: student.name,
    group: student.group,
    school: student.school,
    schoolYear: student.schoolYear,
    className: student.className,
    athleteId: student.athleteId ?? "",
  });
  const [state, setState] = useState<SaveState>("idle");

  const dirty =
    form.name !== student.name ||
    form.group !== student.group ||
    form.school !== student.school ||
    form.schoolYear !== student.schoolYear ||
    form.className !== student.className ||
    form.athleteId !== (student.athleteId ?? "");

  async function patch(body: Record<string, unknown>) {
    setState("saving");
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setState(res.ok ? "saved" : "error");
    if (res.ok) router.refresh();
    return res.ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await patch({ ...form, athleteId: form.athleteId || null });
  }

  async function handleArchive() {
    if (!confirm(`Remover o aluno "${student.name}"? O horário fica arquivado.`)) return;
    const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
    if (res.ok) router.push(`/school/groups/${SLUG_BY_GROUP[student.group]}`);
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  return (
    <div className="panel">
      <h2>Ficha do aluno</h2>
      <form onSubmit={handleSubmit}>
        <label className="field" htmlFor="st-name">
          Nome
        </label>
        <input id="st-name" type="text" value={form.name} onChange={(e) => set("name", e.target.value)} />

        <label className="field" htmlFor="st-group" style={{ marginTop: 10 }}>
          Grupo
        </label>
        <select id="st-group" value={form.group} onChange={(e) => set("group", e.target.value as SchoolGroup)}>
          {(Object.keys(GROUP_LABELS) as SchoolGroup[]).map((g) => (
            <option key={g} value={g}>
              {GROUP_LABELS[g]}
            </option>
          ))}
        </select>

        <label className="field" htmlFor="st-school" style={{ marginTop: 10 }}>
          Escola
        </label>
        <input
          id="st-school"
          type="text"
          list="school-suggestions"
          value={form.school}
          onChange={(e) => set("school", e.target.value)}
          placeholder="Escola Secundária…"
        />
        <datalist id="school-suggestions">
          {schools.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <div>
            <label className="field" htmlFor="st-year">
              Ano
            </label>
            <input
              id="st-year"
              type="text"
              value={form.schoolYear}
              onChange={(e) => set("schoolYear", e.target.value)}
              placeholder="10.º"
            />
          </div>
          <div>
            <label className="field" htmlFor="st-class">
              Turma
            </label>
            <input
              id="st-class"
              type="text"
              value={form.className}
              onChange={(e) => set("className", e.target.value)}
              placeholder="B"
            />
          </div>
        </div>

        <label className="field" htmlFor="st-athlete" style={{ marginTop: 10 }}>
          Atleta ligado
        </label>
        <select id="st-athlete" value={form.athleteId} onChange={(e) => set("athleteId", e.target.value)}>
          <AthleteLinkOptions athletes={athletes} currentStudentId={student.id} />
        </select>

        <div className="row" style={{ alignItems: "center" }}>
          <button type="submit" className="primary" disabled={!dirty || !form.name.trim() || state === "saving"}>
            Guardar ficha
          </button>
          <SaveStatus state={state} />
        </div>
      </form>

      <label className="check">
        <input
          type="checkbox"
          checked={student.includeSaturday}
          onChange={(e) => patch({ includeSaturday: e.target.checked })}
        />
        Incluir sábado no horário
      </label>

      <div className="row" style={{ marginTop: 18 }}>
        <button type="button" className="danger-outline small" onClick={handleArchive}>
          Remover aluno
        </button>
      </div>
    </div>
  );
}
