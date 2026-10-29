import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCriteriosList } from "@/components/scouting/kpi/KpiCriterios";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";
import { BANDAS_GERAIS, KPIS_PERIODICAS, KPIS_POR_JOGO } from "@/lib/scouting-kpi/kpiData";
import type { Kpi } from "@/lib/scouting-kpi/types";

function KpiRow({ kpi }: { kpi: Kpi }) {
  return (
    <ExpandableRow
      id={kpi.id}
      closed={
        <div className="athlete-row-closed">
          <div className="athlete-row-name">
            <strong>{kpi.name}</strong>
            <span className="athlete-row-meta">peso {kpi.peso}</span>
          </div>
          <div className="athlete-row-score">
            <span className="athlete-row-score-label">Cadência</span>
            <span className="athlete-row-score-value">
              {kpi.cadence === "por_jogo" ? "Por jogo" : "Periódica"}
            </span>
          </div>
        </div>
      }
      open={
        <div className="athlete-open">
          <div className="athlete-open-section">
            <h4>Critérios</h4>
            <KpiCriteriosList kpi={kpi} />
          </div>
          <div className="athlete-open-section">
            <h4>Escala de avaliação (0-10)</h4>
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
      }
    />
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
        <ExpandableRowGroup>
          {KPIS_POR_JOGO.map((kpi) => (
            <KpiRow key={kpi.id} kpi={kpi} />
          ))}
        </ExpandableRowGroup>
      </div>

      <div className="panel">
        <h2>Periódica</h2>
        <ExpandableRowGroup>
          {KPIS_PERIODICAS.map((kpi) => (
            <KpiRow key={kpi.id} kpi={kpi} />
          ))}
        </ExpandableRowGroup>
      </div>
    </>
  );
}
