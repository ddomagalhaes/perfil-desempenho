import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";
import type { CompetencyDTO, ProspectDetailDTO } from "@/lib/types";

export function ScoutingCompareTable({
  kpis,
  prospects,
}: {
  kpis: CompetencyDTO[];
  prospects: ProspectDetailDTO[];
}) {
  return (
    <ExpandableRowGroup>
      {kpis.map((kpi) => {
        const withNotes = prospects.filter((p) => p.notes[kpi.id]?.trim()).length;
        return (
          <ExpandableRow
            key={kpi.id}
            id={kpi.id}
            closed={
              <div className="athlete-row-closed">
                <div className="athlete-row-name">
                  <strong>{kpi.name}</strong>
                </div>
                <div className="athlete-row-score">
                  <span className="athlete-row-score-label">Com notas</span>
                  <span className="athlete-row-score-value">
                    {withNotes}/{prospects.length}
                  </span>
                </div>
              </div>
            }
            open={
              <div className="compare-notes">
                {prospects.map((p) => (
                  <div className="compare-note-row" key={p.id}>
                    <strong>{p.name}</strong>
                    <span>{p.notes[kpi.id] || "Sem nota."}</span>
                  </div>
                ))}
              </div>
            }
          />
        );
      })}
    </ExpandableRowGroup>
  );
}
