import { InfoTooltip } from "@/components/wheel/InfoTooltip";
import type { CompetencyDTO, ScoreMap } from "@/lib/types";

export function ScoreList({
  competencies,
  scores,
}: {
  competencies: CompetencyDTO[];
  scores: ScoreMap;
}) {
  return (
    <div className="score-list">
      {competencies.map((c) => (
        <div className="score-item" key={c.id}>
          <span>
            {c.name}
            <InfoTooltip text={c.description} />
          </span>
          <span className="val">{scores[c.id] || 0}/10</span>
        </div>
      ))}
    </div>
  );
}
