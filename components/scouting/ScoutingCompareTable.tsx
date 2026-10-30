import type { CompetencyDTO, ProspectDetailDTO } from "@/lib/types";

/** Tabela normal, sem nada a abrir/fechar — uma comparação só funciona com
 * tudo visível ao mesmo tempo (uma ExpandableRow por KPI escondia as notas
 * dos outros prospetos, o oposto do que "comparar" precisa). */
export function ScoutingCompareTable({
  kpis,
  prospects,
}: {
  kpis: CompetencyDTO[];
  prospects: ProspectDetailDTO[];
}) {
  return (
    <div className="hd-table-wrap">
      <table>
        <thead>
          <tr>
            <th>KPI</th>
            {prospects.map((p) => (
              <th key={p.id}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => (
            <tr key={kpi.id}>
              <td>{kpi.name}</td>
              {prospects.map((p) => (
                <td key={p.id}>{p.notes[kpi.id] || "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
