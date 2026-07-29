"use client";

import { useState } from "react";
import type { Kpi } from "@/lib/scouting-kpi/types";

interface Props {
  kpi: Kpi;
  value: number;
  onChange: (value: number) => void;
}

export function KpiSliderRow({ kpi, value, onChange }: Props) {
  const [showCriterios, setShowCriterios] = useState(false);

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
        <span className="kpi-slider-value">{value}</span>
      </div>
      <div className="kpi-slider-meta">
        <p className="kpi-slider-hint">{kpi.hint}</p>
        <button type="button" onClick={() => setShowCriterios((v) => !v)} className="kpi-slider-toggle">
          ver critérios
        </button>
      </div>
      {showCriterios && (
        <div className="kpi-slider-criterios">
          {kpi.criterios.map((c, i) => (
            <div key={i}>• {c}</div>
          ))}
        </div>
      )}
    </div>
  );
}
