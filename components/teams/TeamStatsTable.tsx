import type { AthleteDTO, CompetencyDTO, CompetencyStatsDTO } from "@/lib/types";

export function TeamStatsTable({
  competencies,
  athletes,
  stats,
}: {
  competencies: CompetencyDTO[];
  athletes: AthleteDTO[];
  stats: CompetencyStatsDTO[];
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Atleta</th>
          {competencies.map((c) => (
            <th key={c.id}>{c.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {athletes.map((a) => (
          <tr key={a.id}>
            <td>{a.name}</td>
            {competencies.map((c) => (
              <td className="mono" key={c.id}>
                {a.scores[c.id] || 0}
              </td>
            ))}
          </tr>
        ))}
        <tr className="avg">
          <td>Média</td>
          {stats.map((s) => (
            <td className="mono" key={s.competencyId}>
              {s.avg.toFixed(1)}
            </td>
          ))}
        </tr>
        <tr className="range">
          <td>Mín. – Máx.</td>
          {stats.map((s) => (
            <td className="mono" key={s.competencyId}>
              {s.min} – {s.max}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
