"use client";

import { useState } from "react";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { PerGameEvaluationForm } from "./PerGameEvaluationForm";
import { PeriodicEvaluationForm } from "./PeriodicEvaluationForm";

interface Props {
  jogadorNome: string;
  context: GameContext;
  periodoLabel: string;
}

type Tab = "por_jogo" | "periodica";

export function EvaluationTabs({ jogadorNome, context, periodoLabel }: Props) {
  const [tab, setTab] = useState<Tab>("por_jogo");

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={tab === "por_jogo" ? "tab active" : "tab"}
          onClick={() => setTab("por_jogo")}
        >
          Por jogo
        </button>
        <button
          type="button"
          className={tab === "periodica" ? "tab active" : "tab"}
          onClick={() => setTab("periodica")}
        >
          Periódica
        </button>
      </div>

      {tab === "por_jogo" ? (
        <PerGameEvaluationForm
          jogadorNome={jogadorNome}
          context={context}
          onSave={(scores) => {
            // TODO: persistir a avaliação por jogo assim que a base de dados
            // tiver um modelo para jogos/avaliações de scouting.
            console.log("TODO onSave PerGameEvaluationForm", { jogadorNome, context, scores });
          }}
        />
      ) : (
        <PeriodicEvaluationForm
          jogadorNome={jogadorNome}
          periodoLabel={periodoLabel}
          onSave={(scores, notas) => {
            // TODO: persistir a avaliação periódica assim que a base de dados
            // tiver um modelo para avaliações de scouting.
            console.log("TODO onSave PeriodicEvaluationForm", { jogadorNome, scores, notas });
          }}
        />
      )}
    </div>
  );
}
