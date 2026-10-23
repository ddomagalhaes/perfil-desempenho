"use client";

import { useState } from "react";
import type { Kpi } from "@/lib/scouting-kpi/types";
import { bandaParaValor, hintParaKpi } from "@/lib/scouting-kpi/kpiData";
import { KpiCriteriosList } from "./KpiCriterios";

interface Props {
  kpi: Kpi;
  value: number;
  onChange: (value: number) => void;
}

export function KpiSliderRow({ kpi, value, onChange }: Props) {
  const [showCriterios, setShowCriterios] = useState(false);
  const banda = bandaParaValor(value);
  const hint = hintParaKpi(kpi);

  return (
    <div className="kpi-slider-row">
      <div className="kpi-slider-head">
        <span className="kpi-slider-name">
          {kpi.name} <span className="kpi-slider-weight">(peso {kpi.peso})</span>
        </span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="kpi-slider-value">
          {value}
          {banda && <span className="kpi-slider-banda"> · {banda.label}</span>}
        </span>
      </div>
      <div className="kpi-slider-meta">
        {hint && <p className="kpi-slider-hint">{hint}</p>}
        <button type="button" onClick={() => setShowCriterios((v) => !v)} className="kpi-slider-toggle">
          ver critérios
        </button>
      </div>
      {showCriterios && <KpiCriteriosList kpi={kpi} />}
    </div>
  );
}
