import Link from "next/link";
import type { AreaScoreSummary, HomeAthleteRow } from "@/lib/data/homeAthletes";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { Delta } from "@/components/ui/Delta";
import { CompetencyBars } from "@/components/ui/CompetencyBars";

function ScoreCell({ label, summary }: { label: string; summary: AreaScoreSummary }) {
  return (
    <div className="athlete-row-score">
      <span className="athlete-row-score-label">{label}</span>
      <span className={summary.average === null ? "athlete-row-score-value is-empty" : "athlete-row-score-value"}>
        {summary.average === null ? "—" : summary.average.toFixed(1)}
      </span>
      <Delta value={summary.trend} />
    </div>
  );
}

export function AthleteRow({ athlete }: { athlete: HomeAthleteRow }) {
  const closed = (
    <div className="athlete-row-closed">
      <div className="athlete-row-name">
        <strong>{athlete.name}</strong>
        <span className="athlete-row-meta">
          {athlete.positionName ?? "Sem posição"} · {athlete.teamName}
        </span>
      </div>
      <ScoreCell label="Psicológico" summary={athlete.psychological} />
      <ScoreCell label="Técnico/Tático" summary={athlete.technical} />
    </div>
  );

  const open = (
    <div className="athlete-open">
      <div className="athlete-open-section">
        <h4>Psicológico</h4>
        <CompetencyBars bars={athlete.psychological.bars.map((b) => ({ id: b.competencyId, name: b.name, value: b.value }))} />
      </div>
      <div className="athlete-open-section">
        <h4>Técnico/Tático</h4>
        <CompetencyBars bars={athlete.technical.bars.map((b) => ({ id: b.competencyId, name: b.name, value: b.value }))} />
      </div>
      <div className="athlete-open-section">
        <h4>Scouting</h4>
        {athlete.scouting ? (
          <>
            <p className="athlete-open-last-eval">
              {athlete.scouting.lastEvaluation
                ? `Última avaliação: ${athlete.scouting.lastEvaluation.label}`
                : "Ligado ao scouting, ainda sem avaliações registadas."}
            </p>
            <div className="athlete-open-actions">
              <Link href={`/scouting/prospects/${athlete.scouting.prospectId}/evaluate`}>Avaliar</Link>
              <Link href={`/scouting/prospects/${athlete.scouting.prospectId}/profile`}>Ver histórico</Link>
              {athlete.scouting.lastEvaluation && (
                <Link href={`/print/scouting/evaluation/${athlete.scouting.lastEvaluation.id}`} target="_blank">
                  Gerar PDF
                </Link>
              )}
            </div>
          </>
        ) : (
          <p className="athlete-open-empty">Ainda não está ligado a um prospeto de scouting.</p>
        )}
      </div>
    </div>
  );

  return <ExpandableRow id={athlete.id} closed={closed} open={open} />;
}
