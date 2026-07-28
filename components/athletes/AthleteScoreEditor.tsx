"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { ScoreList } from "./ScoreList";
import type { CompetencyDTO, ScoreMap } from "@/lib/types";

export function AthleteScoreEditor({
  athleteId,
  competencies,
  initialScores,
}: {
  athleteId: string;
  competencies: CompetencyDTO[];
  initialScores: ScoreMap;
}) {
  const [scores, setScores] = useState<ScoreMap>(initialScores);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const router = useRouter();

  function handleScoreChange(competencyId: string, value: number) {
    setScores((prev) => ({ ...prev, [competencyId]: value }));
    setSaveState("saving");

    clearTimeout(timers.current[competencyId]);
    timers.current[competencyId] = setTimeout(async () => {
      try {
        const res = await fetch("/api/scores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athleteId, competencyId, value }),
        });
        if (!res.ok) throw new Error("save failed");
        setSaveState("saved");
        router.refresh();
      } catch {
        setSaveState("error");
      }
    }, 400);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveStatus state={saveState} />
      </div>
      <PerformanceWheel
        competencies={competencies}
        scores={scores}
        editable
        onScoreChange={handleScoreChange}
      />
      <ScoreList competencies={competencies} scores={scores} />
    </div>
  );
}
