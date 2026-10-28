"use client";

import { useState } from "react";
import { KPIS_PERIODICAS } from "@/lib/scouting-kpi/kpiData";
import { KpiSliderRow } from "./KpiSliderRow";

interface Props {
  jogadorNome: string;
  periodoLabel: string; // sugestão inicial, ex. "últimos 5 jogos" — editável abaixo
  onSave: (scores: Record<string, number>, notas: string, periodo: string) => void;
  onGeneratePdf: (scores: Record<string, number>, notas: string, periodo: string) => void;
  saving?: boolean;
}

export function PeriodicEvaluationForm({
  jogadorNome,
  periodoLabel,
  onSave,
  onGeneratePdf,
  saving,
}: Props) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(KPIS_PERIODICAS.map((k) => [k.id, 5]))
  );
  const [notas, setNotas] = useState("");
  const [periodo, setPeriodo] = useState(periodoLabel);

  return (
    <div className="kpi-form">
      <div className="kpi-context-card">
        <p className="name">{jogadorNome}</p>
        <label className="field" htmlFor="periodic-periodo">
          Período avaliado
        </label>
        <input
          id="periodic-periodo"
          type="text"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          placeholder="Ex.: últimos 5 jogos (22 jun – 26 jul)"
        />
      </div>

      <div>
        <p className="kpi-form-section-label">Competências periódicas</p>
        {KPIS_PERIODICAS.map((kpi) => (
          <KpiSliderRow
            key={kpi.id}
            kpi={kpi}
            value={scores[kpi.id]}
            onChange={(v) => setScores((s) => ({ ...s, [kpi.id]: v }))}
          />
        ))}
      </div>

      <div>
        <label className="field" htmlFor="periodic-notas">
          Notas (opcional)
        </label>
        <textarea
          id="periodic-notas"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observações de balneário, treinos ou conversas com o staff técnico"
        />
      </div>

      <div className="kpi-form-actions">
        <button
          type="button"
          onClick={() => onSave(scores, notas, periodo)}
          className="primary"
          disabled={saving}
        >
          Guardar avaliação periódica
        </button>
        <button type="button" onClick={() => onGeneratePdf(scores, notas, periodo)} disabled={saving}>
          Gerar PDF
        </button>
      </div>
    </div>
  );
}
