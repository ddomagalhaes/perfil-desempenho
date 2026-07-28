"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import type { CompetencyDTO } from "@/lib/types";

export function CompetencyEditor({
  initialCompetencies,
}: {
  initialCompetencies: CompetencyDTO[];
}) {
  const [text, setText] = useState(initialCompetencies.map((c) => c.name).join("\n"));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();

  async function handleSave() {
    const names = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setSaveState("saving");
    try {
      const res = await fetch("/api/competencies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
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
      <label className="field" htmlFor="comp-input">
        Uma por linha
      </label>
      <textarea id="comp-input" value={text} onChange={(e) => setText(e.target.value)} />
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
