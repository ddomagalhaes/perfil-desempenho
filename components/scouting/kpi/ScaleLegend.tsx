"use client";

import { useState } from "react";

// Legenda geral partilhada por todas as competências: define o que significa
// cada banda de 2 pontos (frequência/consistência do comportamento), enquanto
// os critérios específicos de cada KPI (ver KpiSliderRow) dizem "em quê".
const BANDAS = [
  { range: "9-10", label: "Excelente", desc: "presente em quase todas as situações relevantes, sem hesitação" },
  { range: "7-8", label: "Muito Bom", desc: "presente na maioria das situações, falhas pontuais" },
  { range: "5-6", label: "Bom", desc: "presente, mas inconsistente entre situações semelhantes" },
  { range: "3-4", label: "Insuficiente", desc: "raro, mesmo quando a situação o pede" },
  { range: "0-2", label: "Preocupante", desc: "ausente ou comportamento oposto domina" },
];

export function ScaleLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="kpi-legend">
      <button type="button" onClick={() => setOpen((v) => !v)} className="kpi-legend-toggle">
        <span>O que significa cada pontuação?</span>
        <span className={open ? "kpi-legend-caret open" : "kpi-legend-caret"}>▾</span>
      </button>
      {open && (
        <div className="kpi-legend-body">
          {BANDAS.map((b) => (
            <div key={b.range}>
              <strong>
                {b.range} {b.label}
              </strong>{" "}
              — {b.desc}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
