"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompetencyRowsEditor, type CompetencyRow } from "@/components/competencies/CompetencyRowsEditor";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import type { CompetencyDTO, PositionDTO } from "@/lib/types";

function toRows(competencies: CompetencyDTO[]): CompetencyRow[] {
  return competencies.map((c) => ({ key: c.id, name: c.name, description: c.description }));
}

export function PositionManager({
  positions,
  competenciesByPosition,
}: {
  positions: PositionDTO[];
  competenciesByPosition: Record<string, CompetencyDTO[]>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(positions[0]?.id ?? null);
  const [rows, setRows] = useState<CompetencyRow[]>(
    selectedId ? toRows(competenciesByPosition[selectedId] ?? []) : []
  );
  const [newPositionName, setNewPositionName] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();

  // Fall back to the first position if the selection no longer exists (e.g. it was
  // just archived) or none was made yet (e.g. the list was empty on first render and
  // a position has since been created). Adjusted during render, not in an effect, so
  // it takes effect before paint instead of causing an extra render pass.
  const resolvedSelectedId =
    selectedId && positions.some((p) => p.id === selectedId) ? selectedId : positions[0]?.id ?? null;
  const [lastResolvedId, setLastResolvedId] = useState(resolvedSelectedId);
  if (resolvedSelectedId !== lastResolvedId) {
    setLastResolvedId(resolvedSelectedId);
    setSelectedId(resolvedSelectedId);
    setRows(resolvedSelectedId ? toRows(competenciesByPosition[resolvedSelectedId] ?? []) : []);
    setSaveState("idle");
  }

  function selectPosition(id: string) {
    setSelectedId(id);
    setRows(toRows(competenciesByPosition[id] ?? []));
    setSaveState("idle");
  }

  async function handleCreatePosition(e: React.FormEvent) {
    e.preventDefault();
    const name = newPositionName.trim();
    if (!name) return;
    const res = await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setNewPositionName("");
      router.refresh();
    }
  }

  async function handleArchivePosition(id: string, name: string) {
    if (
      !confirm(
        `Remover a posição "${name}"? As competências que só ela usa ficam arquivadas.`
      )
    )
      return;
    const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    }
  }

  async function handleSaveCompetencies() {
    if (!selectedId) return;
    const competencies = rows
      .map((r) => ({ name: r.name.trim(), description: r.description.trim() }))
      .filter((r) => r.name.length > 0);

    setSaveState("saving");
    try {
      const res = await fetch(`/api/positions/${selectedId}/competencies`, {
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

  const selectedPosition = positions.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="layout">
      <div>
        <div className="panel">
          <h2>Posições</h2>
          <form onSubmit={handleCreatePosition} className="row">
            <input
              type="text"
              value={newPositionName}
              onChange={(e) => setNewPositionName(e.target.value)}
              placeholder="Ex.: Guarda-redes"
            />
            <button type="submit" className="primary" disabled={!newPositionName.trim()}>
              Criar
            </button>
          </form>
          <ul className="list-plain">
            {positions.length === 0 && (
              <li style={{ color: "var(--text-muted)", cursor: "default" }}>
                Sem posições ainda
              </li>
            )}
            {positions.map((p) => (
              <li
                key={p.id}
                className={p.id === selectedId ? "active" : ""}
                onClick={() => selectPosition(p.id)}
              >
                <span>{p.name}</span>
                <button
                  type="button"
                  className="del"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchivePosition(p.id, p.name);
                  }}
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        {selectedPosition ? (
          <>
            <h2 style={{ marginTop: 0 }}>Competências — {selectedPosition.name}</h2>
            <p className="hint">
              Uma competência com o mesmo nome pode ser partilhada por várias posições — as
              pontuações já registadas mantêm-se ao renomear.
            </p>
            <CompetencyRowsEditor rows={rows} onChange={setRows} />
            <div className="row" style={{ alignItems: "center" }}>
              <button type="button" className="primary" onClick={handleSaveCompetencies}>
                Guardar competências
              </button>
              <SaveStatus state={saveState} />
            </div>
          </>
        ) : (
          <p className="empty">Cria ou seleciona uma posição para lhe definires as competências.</p>
        )}
      </div>
    </div>
  );
}
