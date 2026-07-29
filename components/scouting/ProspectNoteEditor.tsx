"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import type { CompetencyDTO, NoteMap } from "@/lib/types";

export function ProspectNoteEditor({
  prospectId,
  kpis,
  initialNotes,
}: {
  prospectId: string;
  kpis: CompetencyDTO[];
  initialNotes: NoteMap;
}) {
  const [notes, setNotes] = useState<NoteMap>(initialNotes);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();

  if (kpis.length === 0) {
    return (
      <p className="empty">
        Sem KPIs de scouting configurados ainda. Define-os em Scouting → KPIs.
      </p>
    );
  }

  function updateNote(competencyId: string, value: string) {
    setNotes((prev) => ({ ...prev, [competencyId]: value }));
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    try {
      const results = await Promise.all(
        kpis.map((kpi) =>
          fetch("/api/scouting-notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prospectId,
              competencyId: kpi.id,
              note: notes[kpi.id] ?? "",
            }),
          })
        )
      );
      if (results.some((r) => !r.ok)) throw new Error("save failed");
      setSaveState("saved");
      router.refresh();
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="legend-list" style={{ gridTemplateColumns: "1fr" }}>
      {kpis.map((kpi) => (
        <div className="legend-card" key={kpi.id}>
          <h3>{kpi.name}</h3>
          <p>{kpi.description || "Sem descrição definida."}</p>
          <textarea
            value={notes[kpi.id] ?? ""}
            onChange={(e) => updateNote(kpi.id, e.target.value)}
            rows={3}
            placeholder="Nota de observação…"
            style={{ width: "100%", resize: "vertical", marginTop: 8 }}
          />
        </div>
      ))}
      <div className="row" style={{ alignItems: "center" }}>
        <button type="button" className="primary" onClick={handleSave}>
          Guardar
        </button>
        <SaveStatus state={saveState} />
      </div>
    </div>
  );
}
