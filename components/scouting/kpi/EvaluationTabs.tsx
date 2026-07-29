"use client";

import { useState } from "react";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { PerGameEvaluationForm } from "./PerGameEvaluationForm";
import { PeriodicEvaluationForm } from "./PeriodicEvaluationForm";

interface Props {
  prospectId: string;
  jogadorNome: string;
  context: GameContext;
  periodoLabel: string;
}

type Tab = "por_jogo" | "periodica";

export function EvaluationTabs({ prospectId, jogadorNome, context, periodoLabel }: Props) {
  const [tab, setTab] = useState<Tab>("por_jogo");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function submit(body: Record<string, unknown>) {
    setSaveState("saving");
    try {
      const res = await fetch("/api/scouting-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, ...body }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setSaveState("idle");
  }

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={tab === "por_jogo" ? "tab active" : "tab"}
          onClick={() => switchTab("por_jogo")}
        >
          Por jogo
        </button>
        <button
          type="button"
          className={tab === "periodica" ? "tab active" : "tab"}
          onClick={() => switchTab("periodica")}
        >
          Periódica
        </button>
      </div>

      {tab === "por_jogo" ? (
        <PerGameEvaluationForm
          jogadorNome={jogadorNome}
          context={context}
          onSave={(scores) => submit({ cadence: "por_jogo", scores, context })}
        />
      ) : (
        <PeriodicEvaluationForm
          jogadorNome={jogadorNome}
          periodoLabel={periodoLabel}
          onSave={(scores, notas) => submit({ cadence: "periodica", scores, notas })}
        />
      )}

      <div className="kpi-save-status">
        <SaveStatus state={saveState} />
      </div>
    </div>
  );
}
