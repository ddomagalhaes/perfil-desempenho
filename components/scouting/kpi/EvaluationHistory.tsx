import type { EvaluationCadence } from "@/app/generated/prisma/enums";
import { KPIS, bandaParaValor, scorePonderado, KPIS_POR_JOGO, KPIS_PERIODICAS } from "@/lib/scouting-kpi/kpiData";
import type { EvaluationHistoryEntry } from "@/lib/data/scoutingEvaluations";

const CADENCE_LABEL: Record<EvaluationCadence, string> = {
  POR_JOGO: "Jogo",
  PERIODICA: "Período",
};

function formatColDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="hd-delta hd-delta-flat">—</span>;
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span className="hd-delta hd-delta-flat">0,0</span>;
  const up = rounded > 0;
  return (
    <span className={up ? "hd-delta hd-delta-up" : "hd-delta hd-delta-down"}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {rounded.toFixed(1)}
    </span>
  );
}

function CadenceCard({
  label,
  entries,
  kpis,
}: {
  label: string;
  entries: EvaluationHistoryEntry[];
  kpis: typeof KPIS_POR_JOGO;
}) {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length === 0) {
    return (
      <div className="hd-summary-card">
        <p className="hd-summary-label">{label}</p>
        <p className="empty" style={{ padding: "12px 0" }}>
          Sem avaliações ainda.
        </p>
      </div>
    );
  }
  const scores = sorted.map((e) => scorePonderado(kpis, e.scores));
  const latest = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;
  const delta = previous === null ? null : latest - previous;
  const banda = bandaParaValor(latest);

  return (
    <div className="hd-summary-card">
      <p className="hd-summary-label">{label}</p>
      <div className="hd-summary-value">
        {latest.toFixed(1)}
        {banda && <span className="kpi-score-banda"> · {banda.label}</span>}
      </div>
      <Delta value={delta} />
      <p className="hd-summary-meta">
        {sorted.length} avaliaç{sorted.length === 1 ? "ão" : "ões"}
      </p>
    </div>
  );
}

export function EvaluationHistory({ entries }: { entries: EvaluationHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="empty">Sem avaliações registadas ainda.</p>;
  }

  const sortedAsc = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const columns = sortedAsc.slice(-5);

  const rows = KPIS.map((kpi) => {
    const cells = columns.map((col) => col.scores[kpi.id] ?? null);
    const withValue = sortedAsc.filter((e) => kpi.id in e.scores);
    const last = withValue.length > 0 ? withValue[withValue.length - 1].scores[kpi.id] : null;
    const prev = withValue.length > 1 ? withValue[withValue.length - 2].scores[kpi.id] : null;
    const delta = last !== null && prev !== null ? last - prev : null;
    return { kpi, cells, delta, hasData: withValue.length > 0 };
  }).filter((r) => r.hasData);

  const porJogoEntries = entries.filter((e) => e.cadence === "POR_JOGO");
  const periodicaEntries = entries.filter((e) => e.cadence === "PERIODICA");

  return (
    <div className="hd-layout">
      <div className="hd-table-wrap">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Competência</th>
              {columns.map((col) => (
                <th key={col.id}>
                  <span className="hd-col-date">{formatColDate(col.createdAt)}</span>
                  <span className="hd-col-cadence">{CADENCE_LABEL[col.cadence]}</span>
                </th>
              ))}
              <th>Variação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ kpi, cells, delta }) => (
              <tr key={kpi.id}>
                <td>{kpi.name}</td>
                {cells.map((v, i) => (
                  <td key={columns[i].id} className="mono">
                    {v ?? "—"}
                  </td>
                ))}
                <td>
                  <Delta value={delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hd-summary">
        <CadenceCard label="Score ponderado — por jogo" entries={porJogoEntries} kpis={KPIS_POR_JOGO} />
        <CadenceCard label="Score ponderado — periódica" entries={periodicaEntries} kpis={KPIS_PERIODICAS} />
      </div>
    </div>
  );
}
