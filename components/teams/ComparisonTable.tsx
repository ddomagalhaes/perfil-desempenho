import type { CompetencyDTO, TeamAverageSeriesDTO } from "@/lib/types";

export function ComparisonTable({
  competencies,
  series,
}: {
  competencies: CompetencyDTO[];
  series: (TeamAverageSeriesDTO & { color: string })[];
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Equipa</th>
          {competencies.map((c) => (
            <th key={c.id}>{c.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {series.map((s) => (
          <tr key={s.teamId}>
            <td>
              <span className="sw" style={{ background: s.color }} />
              {s.teamName}
            </td>
            {competencies.map((c) => (
              <td className="mono" key={c.id}>
                {(s.averages[c.id] ?? 0).toFixed(1)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
