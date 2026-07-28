"use client";

import type { CompetencyInput } from "@/lib/types";

export type CompetencyRow = CompetencyInput & { key: string };

let nextKey = 0;
export function makeRowKey() {
  nextKey += 1;
  return `new-${nextKey}`;
}

export function CompetencyRowsEditor({
  rows,
  onChange,
}: {
  rows: CompetencyRow[];
  onChange: (rows: CompetencyRow[]) => void;
}) {
  function updateRow(key: string, patch: Partial<CompetencyInput>) {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    onChange(rows.filter((r) => r.key !== key));
  }

  function addRow() {
    onChange([...rows, { key: makeRowKey(), name: "", description: "" }]);
  }

  function moveRow(key: string, direction: -1 | 1) {
    const index = rows.findIndex((r) => r.key === key);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
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
    </div>
  );
}
