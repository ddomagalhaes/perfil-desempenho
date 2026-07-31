"use client";

import { useState } from "react";
import type { Kpi } from "@/lib/scouting-kpi/types";

interface Props {
  kpi: Kpi;
  value: number;
  onChange: (value: number) => void;
}

const CATEGORIAS: { key: keyof Pick<Kpi, "criteriosVideo" | "criteriosAoVivo" | "criteriosInferencial">; titulo: string }[] = [
  { key: "criteriosVideo", titulo: "Visível em vídeo / Wyscout" },
  { key: "criteriosAoVivo", titulo: "Requer presença ao vivo / áudio" },
  { key: "criteriosInferencial", titulo: "Inferencial / juízo agregado" },
];

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
        <button type="button" onClick={() => setShowCriterios((v) => !v)} className="kpi-slider-toggle">
          ver critérios
        </button>
      </div>
      {showCriterios && (
        <div className="kpi-slider-criterios">
          {CATEGORIAS.map(({ key, titulo }) => {
            const items = kpi[key];
            if (items.length === 0) return null;
            return (
              <div key={key} className="kpi-slider-criterios-categoria">
                <strong>{titulo}</strong>
                {items.map((c, i) => (
                  <div key={i}>• {c}</div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
