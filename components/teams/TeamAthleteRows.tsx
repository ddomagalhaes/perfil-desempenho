import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";
import { CompetencyBars } from "@/components/ui/CompetencyBars";
import type { AthleteDTO, CompetencyDTO } from "@/lib/types";

function average(athlete: AthleteDTO, competencies: CompetencyDTO[]): number | null {
  const values = competencies
    .map((c) => athlete.scores[c.id])
    .filter((v): v is number => v !== undefined);
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

/** Linha por atleta (ExpandableRow): fechada mostra o nome e a média das
 * competências desta área; aberta mostra as mini-barras 0-10 por competência.
 * Só para o ecrã — a tabela de impressão (TeamStatsTable) continua à parte,
 * sempre visível, porque uma folha de PDF não tem hover nem clique. */
export function TeamAthleteRows({
  competencies,
  athletes,
}: {
  competencies: CompetencyDTO[];
  athletes: AthleteDTO[];
}) {
  if (athletes.length === 0) {
    return <p className="empty">Sem atletas ainda.</p>;
  }

  return (
    <ExpandableRowGroup>
      {athletes.map((athlete) => {
        const avg = average(athlete, competencies);
        const bars = competencies
          .map((c) => ({ id: c.id, name: c.name, value: athlete.scores[c.id] }))
          .filter((b): b is { id: string; name: string; value: number } => b.value !== undefined);

        return (
          <ExpandableRow
            key={athlete.id}
            id={athlete.id}
            closed={
              <div className="athlete-row-closed">
                <div className="athlete-row-name">
                  <strong>{athlete.name}</strong>
                  {athlete.positionName && <span className="athlete-row-meta">{athlete.positionName}</span>}
                </div>
                <div className="athlete-row-score">
                  <span className="athlete-row-score-label">Média</span>
                  <span className={avg === null ? "athlete-row-score-value is-empty" : "athlete-row-score-value"}>
                    {avg === null ? "—" : avg.toFixed(1)}
                  </span>
                </div>
              </div>
            }
            open={<CompetencyBars bars={bars} />}
          />
        );
      })}
    </ExpandableRowGroup>
  );
}
