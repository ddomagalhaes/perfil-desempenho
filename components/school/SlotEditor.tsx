"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime, parseTime, type SlotDTO } from "@/lib/school/schedule";

type Row = {
  key: string;
  id?: string;
  start: string;
  end: string;
  kind: "LESSON" | "BREAK";
  label: string;
  hasLessons: boolean;
};

let rowSeq = 0;
const newKey = () => `new-${++rowSeq}`;

function toRows(slots: SlotDTO[]): Row[] {
  return slots.map((s) => ({
    key: s.id,
    id: s.id,
    start: formatTime(s.startMin),
    end: formatTime(s.endMin),
    kind: s.kind,
    label: s.label,
    hasLessons: Object.keys(s.lessons).length > 0,
  }));
}

export function SlotEditor({ studentId, slots }: { studentId: string; slots: SlotDTO[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => toRows(slots));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gerador: N aulas de X min a partir de uma hora, com Y min entre aulas.
  const [genStart, setGenStart] = useState("08:15");
  const [genDuration, setGenDuration] = useState(50);
  const [genCount, setGenCount] = useState(5);
  const [genGap, setGenGap] = useState(10);

  // Quando o horário muda no servidor (ex.: depois de copiar de um colega) e não
  // há edições por guardar, volta a sincronizar a lista com os blocos atuais.
  const serverKey = slots.map((s) => `${s.id}:${s.startMin}-${s.endMin}:${s.kind}:${s.label}:${Object.keys(s.lessons).length}`).join("|");
  const [syncedKey, setSyncedKey] = useState(serverKey);
  if (serverKey !== syncedKey && !dirty) {
    setSyncedKey(serverKey);
    setRows(toRows(slots));
  }

  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setDirty(true);
  }

  function addRow(kind: Row["kind"]) {
    setRows((rs) => {
      const lastEnd = parseTime(rs[rs.length - 1]?.end ?? "") ?? 8 * 60 + 15;
      const duration = kind === "BREAK" ? 20 : 50;
      return [
        ...rs,
        {
          key: newKey(),
          start: formatTime(lastEnd),
          end: formatTime(Math.min(lastEnd + duration, 23 * 60 + 59)),
          kind,
          label: kind === "BREAK" ? "Intervalo" : "",
          hasLessons: false,
        },
      ];
    });
    setDirty(true);
  }

  function removeRow(row: Row) {
    if (row.hasLessons && !confirm("Este bloco tem aulas preenchidas. Remover mesmo assim?")) return;
    setRows((rs) => rs.filter((r) => r.key !== row.key));
    setDirty(true);
  }

  function generate() {
    const start = parseTime(genStart);
    if (start === null || genDuration <= 0 || genCount <= 0) return;
    if (rows.some((r) => r.hasLessons) && !confirm("Substituir os blocos atuais? As aulas já preenchidas perdem-se.")) {
      return;
    }
    const generated: Row[] = [];
    let t = start;
    for (let i = 0; i < genCount && t + genDuration <= 24 * 60; i++) {
      generated.push({
        key: newKey(),
        start: formatTime(t),
        end: formatTime(t + genDuration),
        kind: "LESSON",
        label: "",
        hasLessons: false,
      });
      t += genDuration + Math.max(0, genGap);
    }
    setRows(generated);
    setDirty(true);
  }

  async function save() {
    const parsed = [];
    for (const r of rows) {
      const startMin = parseTime(r.start);
      const endMin = parseTime(r.end);
      if (startMin === null || endMin === null || endMin <= startMin) {
        setError(`Bloco ${r.start}–${r.end}: o fim tem de ser depois do início.`);
        return;
      }
      parsed.push({ id: r.id, startMin, endMin, kind: r.kind, label: r.label });
    }
    parsed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i].startMin < parsed[i - 1].endMin) {
        setError(
          `Os blocos ${formatTime(parsed[i - 1].startMin)} e ${formatTime(parsed[i].startMin)} sobrepõem-se.`
        );
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/slots`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: parsed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Não foi possível guardar.");
        return;
      }
      setDirty(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setRows(toRows(slots));
    setDirty(false);
    setError(null);
  }

  return (
    <div className="panel">
      <h2>Blocos horários</h2>
      {rows.length === 0 && <p className="hint">Sem blocos. Gera-os abaixo ou adiciona um a um.</p>}
      {rows.map((r) => (
        <div key={r.key}>
          <div className="slot-row">
            <input
              type="time"
              value={r.start}
              aria-label="Início"
              onChange={(e) => update(r.key, { start: e.target.value })}
            />
            <input
              type="time"
              value={r.end}
              aria-label="Fim"
              onChange={(e) => update(r.key, { end: e.target.value })}
            />
            <select
              value={r.kind}
              aria-label="Tipo de bloco"
              onChange={(e) =>
                update(r.key, {
                  kind: e.target.value as Row["kind"],
                  label: e.target.value === "BREAK" && !r.label ? "Intervalo" : r.label,
                })
              }
            >
              <option value="LESSON">Aula</option>
              <option value="BREAK">Pausa</option>
            </select>
            <button type="button" className="del-btn" onClick={() => removeRow(r)} aria-label="Remover bloco">
              ×
            </button>
          </div>
          {r.kind === "BREAK" && (
            <div className="slot-label">
              <input
                type="text"
                value={r.label}
                aria-label="Nome da pausa"
                placeholder="Intervalo, Almoço…"
                onChange={(e) => update(r.key, { label: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}

      <div className="row">
        <button type="button" className="small" onClick={() => addRow("LESSON")}>
          + Aula
        </button>
        <button type="button" className="small" onClick={() => addRow("BREAK")}>
          + Pausa
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {dirty && (
        <div className="row">
          <button type="button" className="primary" onClick={save} disabled={saving}>
            {saving ? "A guardar…" : "Guardar blocos"}
          </button>
          <button type="button" onClick={discard} disabled={saving}>
            Descartar
          </button>
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary className="hint" style={{ cursor: "pointer" }}>
          Gerar blocos automaticamente
        </summary>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <label className="field">
            Primeira aula
            <input type="time" value={genStart} onChange={(e) => setGenStart(e.target.value)} />
          </label>
          <label className="field">
            Nº de aulas
            <input
              className="compact"
              type="number"
              min={1}
              max={14}
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
            />
          </label>
          <label className="field">
            Duração (min)
            <input
              className="compact"
              type="number"
              min={5}
              max={180}
              step={5}
              value={genDuration}
              onChange={(e) => setGenDuration(Number(e.target.value))}
            />
          </label>
          <label className="field">
            Entre aulas (min)
            <input
              className="compact"
              type="number"
              min={0}
              max={120}
              step={5}
              value={genGap}
              onChange={(e) => setGenGap(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="row">
          <button type="button" className="small" onClick={generate}>
            Gerar (substitui a lista)
          </button>
        </div>
        <p className="hint">Depois de gerar, ajusta horas ou acrescenta pausas e carrega em Guardar.</p>
      </details>
    </div>
  );
}
