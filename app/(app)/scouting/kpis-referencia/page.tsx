import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCriteriosList } from "@/components/scouting/kpi/KpiCriterios";
import { BANDAS_GERAIS, KPIS_PERIODICAS, KPIS_POR_JOGO } from "@/lib/scouting-kpi/kpiData";
import type { Kpi } from "@/lib/scouting-kpi/types";

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="panel" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>
        {kpi.name} <span className="kpi-slider-weight">(peso {kpi.peso})</span>
      </h3>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>
        {kpi.cadence === "por_jogo" ? "Por jogo" : "Periódica"}
      </p>
      <KpiCriteriosList kpi={kpi} />
    </div>
  );
}

export default function KpisReferenciaPage() {
  return (
    <>
      <PageHeader
        title="Referência de KPIs de Scouting"
        subtitle="Consulta rápida para quem avalia jogadores — sem sliders, sem gravação."
      />

      <div className="panel">
        <h2>Escala de avaliação (0-10)</h2>
        <div className="kpi-legend">
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
        </div>
      </div>

      <div className="panel">
        <h2>Por jogo</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {KPIS_POR_JOGO.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Periódica</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {KPIS_PERIODICAS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>
    </>
  );
}
