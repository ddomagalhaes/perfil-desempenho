"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GROUP_LABELS, studentClassLabel, type StudentDTO } from "@/lib/school/schedule";

/** Colegas da mesma escola/ano/turma primeiro — são quase sempre os que
 * partilham o horário. */
function sortByClassmates(student: StudentDTO, others: StudentDTO[]) {
  const isClassmate = (o: StudentDTO) =>
    !!student.className &&
    o.school === student.school &&
    o.schoolYear === student.schoolYear &&
    o.className === student.className;
  return [...others]
    .map((o) => ({ ...o, classmate: isClassmate(o) }))
    .sort((a, b) => Number(b.classmate) - Number(a.classmate) || a.name.localeCompare(b.name, "pt"));
}

function describe(o: StudentDTO & { classmate: boolean }) {
  const cls = studentClassLabel(o);
  return `${o.name}${cls ? ` · ${cls}` : ""} · ${GROUP_LABELS[o.group]}${o.classmate ? " (mesma turma)" : ""}`;
}

export function CopySchedulePanel({
  student,
  others,
  hasSchedule,
}: {
  student: StudentDTO;
  others: StudentDTO[];
  hasSchedule: boolean;
}) {
  const router = useRouter();
  const sorted = sortByClassmates(student, others);
  const [fromId, setFromId] = useState("");
  const [targets, setTargets] = useState<Set<string>>(
    () => new Set(sorted.filter((o) => o.classmate).map((o) => o.id))
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copy(from: string, to: string) {
    const res = await fetch(`/api/students/${to}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromStudentId: from }),
    });
    return res.ok;
  }

  async function copyFrom() {
    if (!fromId) return;
    const source = others.find((o) => o.id === fromId);
    if (hasSchedule && !confirm(`Substituir o horário de ${student.name} pelo de ${source?.name}?`)) return;
    setBusy(true);
    setMessage(null);
    const ok = await copy(fromId, student.id);
    setBusy(false);
    setMessage(ok ? "Horário copiado." : "Não foi possível copiar.");
    if (ok) {
      setFromId("");
      router.refresh();
    }
  }

  async function copyTo() {
    const ids = [...targets];
    if (ids.length === 0) return;
    if (!confirm(`Substituir o horário de ${ids.length} aluno(s) pelo de ${student.name}?`)) return;
    setBusy(true);
    setMessage(null);
    let done = 0;
    for (const id of ids) if (await copy(student.id, id)) done++;
    setBusy(false);
    setMessage(`Copiado para ${done} de ${ids.length} aluno(s).`);
    router.refresh();
  }

  function toggle(id: string) {
    setTargets((t) => {
      const next = new Set(t);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (others.length === 0) return null;

  return (
    <div className="panel">
      <h2>Copiar horário</h2>
      <label className="field" htmlFor="copy-from">
        Copiar de outro aluno para este
      </label>
      <div className="row" style={{ marginTop: 0 }}>
        <select id="copy-from" value={fromId} onChange={(e) => setFromId(e.target.value)} style={{ flex: 1 }}>
          <option value="">Escolhe um aluno…</option>
          {sorted.map((o) => (
            <option key={o.id} value={o.id}>
              {describe(o)}
            </option>
          ))}
        </select>
        <button type="button" className="primary" onClick={copyFrom} disabled={!fromId || busy}>
          Copiar
        </button>
      </div>

      {hasSchedule && (
        <>
          <label className="field" style={{ marginTop: 16 }}>
            Copiar este horário para…
          </label>
          <div className="copy-list">
            {sorted.map((o) => (
              <label key={o.id}>
                <input type="checkbox" checked={targets.has(o.id)} onChange={() => toggle(o.id)} />
                {describe(o)}
              </label>
            ))}
          </div>
          <div className="row">
            <button type="button" onClick={copyTo} disabled={targets.size === 0 || busy}>
              Copiar para {targets.size} aluno(s)
            </button>
          </div>
        </>
      )}
      {message && <p className="hint">{message}</p>}
      <p className="hint">Copiar substitui os blocos e as aulas do aluno de destino.</p>
    </div>
  );
}
