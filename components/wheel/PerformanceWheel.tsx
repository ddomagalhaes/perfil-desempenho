"use client";

import { buildWheelData, nextScoreForRingClick } from "@/lib/wheel/wheel-geometry";
import type { CompetencyDTO, ScoreMap } from "@/lib/types";

export function PerformanceWheel({
  competencies,
  scores,
  editable = false,
  onScoreChange,
}: {
  competencies: CompetencyDTO[];
  scores: ScoreMap;
  editable?: boolean;
  onScoreChange?: (competencyId: string, value: number) => void;
}) {
  if (competencies.length === 0) {
    return <p className="empty">Adiciona competências no painel à esquerda.</p>;
  }

  const ids = competencies.map((c) => c.id);
  const labels = Object.fromEntries(competencies.map((c) => [c.id, c.name]));
  const wheel = buildWheelData(ids, labels, scores);

  return (
    <svg
      viewBox={`0 0 ${wheel.size} ${wheel.size + 40}`}
      width="100%"
      style={{ maxWidth: 520, display: "block", margin: "0 auto" }}
    >
      {wheel.gridRings.map((r, i) => (
        <circle
          key={i}
          cx={wheel.cx}
          cy={wheel.cy}
          r={r}
          fill="none"
          stroke="var(--graph-grid)"
          strokeWidth={0.75}
        />
      ))}

      {wheel.sectors.map((sector) => {
        const competencyId = ids[sector.competencyIndex];
        const fill = sector.filled ? "var(--accent-dark)" : "var(--graph-grid)";
        const opacity = sector.filled ? sector.opacity : 1;
        return (
          <path
            key={`${sector.competencyIndex}-${sector.ring}`}
            d={sector.d}
            fill={fill}
            opacity={opacity}
            stroke="var(--bg)"
            strokeWidth={1}
            style={editable ? { cursor: "pointer" } : undefined}
            onClick={
              editable && onScoreChange
                ? () => {
                    const current = scores[competencyId] || 0;
                    onScoreChange(competencyId, nextScoreForRingClick(current, sector.ring));
                  }
                : undefined
            }
          />
        );
      })}

      {wheel.maxedWedges.map((w) => (
        <path
          key={w.competencyIndex}
          d={w.d}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={2}
        />
      ))}

      {wheel.labels.map((label) => (
        <g key={label.competencyIndex}>
          <text
            x={label.labelPos.x}
            y={label.labelPos.y}
            transform={`rotate(${label.rotation} ${label.labelPos.x} ${label.labelPos.y})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="var(--text)"
            fontFamily="var(--font-inter), sans-serif"
          >
            {label.name}
          </text>
          <text
            x={label.scorePos.x}
            y={label.scorePos.y}
            transform={`rotate(${label.rotation} ${label.scorePos.x} ${label.scorePos.y})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--accent-dark)"
            fontFamily="var(--font-jetbrains), monospace"
          >
            {label.score}
          </text>
        </g>
      ))}

      <circle cx={wheel.cx} cy={wheel.cy} r={3} fill="var(--text-muted)" />
    </svg>
  );
}
