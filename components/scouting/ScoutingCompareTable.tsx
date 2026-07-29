import type { CompetencyDTO, ProspectDetailDTO } from "@/lib/types";

export function ScoutingCompareTable({
  kpis,
  prospects,
}: {
  kpis: CompetencyDTO[];
  prospects: ProspectDetailDTO[];
}) {
  return (
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
  );
}
