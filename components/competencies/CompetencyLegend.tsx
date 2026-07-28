import type { CompetencyDTO } from "@/lib/types";

export function CompetencyLegend({ competencies }: { competencies: CompetencyDTO[] }) {
  if (competencies.length === 0) {
    return <p className="empty">Sem competências configuradas ainda.</p>;
  }

  return (
    <div className="legend-list">
      {competencies.map((c) => (
        <div className="legend-card" key={c.id}>
          <h3>{c.name}</h3>
          <p>{c.description || "Sem descrição definida."}</p>
        </div>
      ))}
    </div>
  );
}
