"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { CompetencyRowsEditor, type CompetencyRow } from "./CompetencyRowsEditor";
import type { AreaSlug } from "@/lib/areas";
import type { CompetencyDTO } from "@/lib/types";

export function CompetencyEditor({
  area,
  initialCompetencies,
}: {
  area: AreaSlug;
  initialCompetencies: CompetencyDTO[];
}) {
  const [rows, setRows] = useState<CompetencyRow[]>(
    initialCompetencies.map((c) => ({ key: c.id, name: c.name, description: c.description }))
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();

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
        body: JSON.stringify({ area, competencies }),
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
      <CompetencyRowsEditor rows={rows} onChange={setRows} />

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
