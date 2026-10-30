"use client";

import { useMemo } from "react";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { KPIS_POR_JOGO, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import { GameContextBadges } from "./GameContextBadges";
import { ScaleLegend } from "./ScaleLegend";
import { WeightedScoreCard } from "./WeightedScoreCard";
import { KpiSliderRow } from "./KpiSliderRow";

interface Props {
  context: GameContext;
  onContextChange: (patch: Partial<GameContext>) => void;
  scores: Record<string, number>;
  onScoreChange: (kpiId: string, value: number) => void;
}

/** Bloco "avaliação por jogo" — sem estado próprio nem botões de ação, porque
 * agora faz parte de uma única sessão de avaliação gerida pelo EvaluationForm
 * (ver aí porquê). */
export function PerGameFields({ context, onContextChange, scores, onScoreChange }: Props) {
  const score = useMemo(() => scorePonderado(KPIS_POR_JOGO, scores), [scores]);

  return (
    <div className="kpi-form-section">
      <h3 className="kpi-form-section-title">Avaliação por jogo</h3>
      <div className="kpi-context-card">
        <p className="kpi-context-label">
          Contexto do jogo — preenche à mão, ainda não há nenhuma fonte automática
        </p>
        <GameContextBadges context={context} onChange={onContextChange} />
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
            onChange={(v) => onScoreChange(kpi.id, v)}
          />
        ))}
      </div>
    </div>
  );
}
