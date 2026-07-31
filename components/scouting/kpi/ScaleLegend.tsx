"use client";

import { useState } from "react";
import { BANDAS_GERAIS } from "@/lib/scouting-kpi/kpiData";

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
          {BANDAS_GERAIS.map((b) => (
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
