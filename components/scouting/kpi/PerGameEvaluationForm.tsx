"use client";

import { useMemo, useState } from "react";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { KPIS_POR_JOGO, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import { GameContextBadges } from "./GameContextBadges";
import { ScaleLegend } from "./ScaleLegend";
import { WeightedScoreCard } from "./WeightedScoreCard";
import { KpiSliderRow } from "./KpiSliderRow";

interface Props {
  jogadorNome: string;
  context: GameContext;
  onSave: (scores: Record<string, number>) => void;
}

export function PerGameEvaluationForm({ jogadorNome, context, onSave }: Props) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(KPIS_POR_JOGO.map((k) => [k.id, 5]))
  );
  const [ctx, setCtx] = useState(context);

  const score = useMemo(() => scorePonderado(KPIS_POR_JOGO, scores), [scores]);

  return (
    <div className="kpi-form">
      <div className="kpi-context-card">
        <p className="name">{jogadorNome}</p>
        <p className="kpi-context-label">Contexto do jogo — auto-preenchido (editável se faltar dado)</p>
        <GameContextBadges
          context={ctx}
          onMinutoEntradaChange={(minuto) => setCtx((c) => ({ ...c, minutoEntrada: minuto }))}
        />
      </div>

      <ScaleLegend />

      <WeightedScoreCard label="Score ponderado (por jogo)" value={score} />

      <div>
        <p className="kpi-form-section-label">Competências por jogo</p>
        {KPIS_POR_JOGO.map((kpi) => (
          <KpiSliderRow
            key={kpi.id}
            kpi={kpi}
            value={scores[kpi.id]}
            onChange={(v) => setScores((s) => ({ ...s, [kpi.id]: v }))}
          />
        ))}
      </div>

      <button type="button" onClick={() => onSave(scores)} className="primary">
        Guardar avaliação
      </button>
    </div>
  );
}
