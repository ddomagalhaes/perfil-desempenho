import { KPIS_PERIODICAS, KPIS_POR_JOGO, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import type { EvaluationHistoryEntry } from "@/lib/data/scoutingEvaluations";

const CADENCE_LABEL: Record<EvaluationHistoryEntry["cadence"], string> = {
  POR_JOGO: "Por jogo",
  PERIODICA: "Periódica",
};

export function EvaluationHistory({ entries }: { entries: EvaluationHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="empty">Sem avaliações registadas ainda.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Cadência</th>
          <th>Score ponderado</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const kpis = entry.cadence === "POR_JOGO" ? KPIS_POR_JOGO : KPIS_PERIODICAS;
          return (
            <tr key={entry.id}>
              <td className="mono">{new Date(entry.createdAt).toLocaleString("pt-PT")}</td>
              <td>{CADENCE_LABEL[entry.cadence]}</td>
              <td className="mono">{scorePonderado(kpis, entry.scores).toFixed(1)}</td>
              <td>{entry.notas || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
