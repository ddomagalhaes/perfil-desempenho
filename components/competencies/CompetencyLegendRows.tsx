import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";
import type { CompetencyDTO } from "@/lib/types";

/** Versão expansível da legenda, só para ecrã — fechada mostra o nome,
 * aberta mostra a definição completa. A versão sempre visível (CompetencyLegend)
 * continua a ser usada no PDF, que não tem hover nem clique. */
export function CompetencyLegendRows({ competencies }: { competencies: CompetencyDTO[] }) {
  if (competencies.length === 0) {
    return <p className="empty">Sem competências configuradas ainda.</p>;
  }

  return (
    <ExpandableRowGroup>
      {competencies.map((c) => (
        <ExpandableRow
          key={c.id}
          id={c.id}
          closed={
            <div className="athlete-row-closed">
              <div className="athlete-row-name">
                <strong>{c.name}</strong>
              </div>
            </div>
          }
          open={<p className="legend-row-description">{c.description || "Sem descrição definida."}</p>}
        />
      ))}
    </ExpandableRowGroup>
  );
}
