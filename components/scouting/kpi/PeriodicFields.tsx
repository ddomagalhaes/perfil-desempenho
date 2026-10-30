"use client";

import { useMemo } from "react";
import { KPIS_PERIODICAS, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import { WeightedScoreCard } from "./WeightedScoreCard";
import { KpiSliderRow } from "./KpiSliderRow";

interface Props {
  periodo: string;
  onPeriodoChange: (value: string) => void;
  scores: Record<string, number>;
  onScoreChange: (kpiId: string, value: number) => void;
}

/** Bloco "avaliação periódica" — sem estado próprio nem botões de ação, ver
 * PerGameFields para o porquê. */
export function PeriodicFields({ periodo, onPeriodoChange, scores, onScoreChange }: Props) {
  const score = useMemo(() => scorePonderado(KPIS_PERIODICAS, scores), [scores]);

  return (
    <div className="kpi-form-section">
      <h3 className="kpi-form-section-title">Avaliação periódica</h3>
      <div className="kpi-context-card">
        <label className="field" htmlFor="periodic-periodo">
          Período avaliado
        </label>
        <input
          id="periodic-periodo"
          type="text"
          value={periodo}
          onChange={(e) => onPeriodoChange(e.target.value)}
          placeholder="Ex.: últimos 5 jogos (22 jun – 26 jul)"
        />
      </div>

      <WeightedScoreCard label="Score ponderado (periódica)" value={score} />

      <div>
        <p className="kpi-form-section-label">Competências periódicas</p>
        {KPIS_PERIODICAS.map((kpi) => (
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
