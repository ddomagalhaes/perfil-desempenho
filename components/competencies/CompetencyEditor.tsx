"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import type { CompetencyDTO, CompetencyInput } from "@/lib/types";

type Row = CompetencyInput & { key: string };

let nextKey = 0;
function makeKey() {
  nextKey += 1;
  return `new-${nextKey}`;
}

export function CompetencyEditor({
  initialCompetencies,
}: {
  initialCompetencies: CompetencyDTO[];
}) {
  const [rows, setRows] = useState<Row[]>(
    initialCompetencies.map((c) => ({ key: c.id, name: c.name, description: c.description }))
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();

  function updateRow(key: string, patch: Partial<CompetencyInput>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: makeKey(), name: "", description: "" }]);
  }

  function moveRow(key: string, direction: -1 | 1) {
    setRows((prev) => {
      const index = prev.findIndex((r) => r.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    const competencies = rows
      .map((r) => ({ name: r.name.trim(), description: r.description.trim() }))
      .filter((r) => r.name.length > 0);
    if (competencies.length === 0) return;

    setSaveState("saving");
    try {
      const res = await fetch("/api/competencies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competencies }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
      router.refresh();
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div key={row.key} className="panel" style={{ padding: 12 }}>
            <div className="row" style={{ marginTop: 0, alignItems: "center" }}>
              <input
                type="text"
                placeholder="Nome da competência"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="small"
                disabled={i === 0}
                onClick={() => moveRow(row.key, -1)}
                aria-label="Mover para cima"
              >
                ▲
              </button>
              <button
                type="button"
                className="small"
                disabled={i === rows.length - 1}
                onClick={() => moveRow(row.key, 1)}
                aria-label="Mover para baixo"
              >
                ▼
              </button>
              <button
                type="button"
                className="small danger-outline"
                onClick={() => removeRow(row.key)}
              >
                remover
              </button>
            </div>
            <label className="field" style={{ marginTop: 8 }}>
              Descrição (mostrada como legenda e no ⓘ da pontuação)
            </label>
            <textarea
              value={row.description}
              onChange={(e) => updateRow(row.key, { description: e.target.value })}
              style={{ minHeight: 60 }}
              placeholder="Ex.: Grau de confiança do atleta nas suas capacidades para competir."
            />
          </div>
        ))}
      </div>

      <div className="row">
        <button type="button" onClick={addRow}>
          Adicionar competência
        </button>
      </div>

      <div className="row" style={{ alignItems: "center" }}>
        <button type="button" className="primary" onClick={handleSave}>
          Guardar competências
        </button>
        <SaveStatus state={saveState} />
      </div>
      <p className="hint">
        Alterar esta lista mantém as pontuações já registadas para as competências que não
        mudarem de nome.
      </p>
    </div>
  );
}
