import { polar } from "@/lib/wheel/wheel-geometry";
import type { CompetencyDTO, TeamAverageSeriesDTO } from "@/lib/types";

export const RADAR_SERIES_COLORS = [
  "#1f7a4d", // dark green (matches wheel accent)
  "#a67c00", // dark goldenrod
  "#2f5fa8", // dark blue
  "#8e44ad", // dark purple
  "#a8442e", // dark terracotta
  "#2b7a78", // dark teal
];

const SIZE = 460;
const RADIUS = 165;
const MAX_VALUE = 10;

export function RadarChart({
  competencies,
  series,
}: {
  competencies: CompetencyDTO[];
  series: (TeamAverageSeriesDTO & { color: string })[];
}) {
  const N = competencies.length;
  if (N === 0) {
    return <p className="empty">Adiciona competências para veres o radar de comparação.</p>;
  }

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const angleStep = 360 / N;

  const gridRings: number[] = [];
  for (let g = 2; g <= MAX_VALUE; g += 2) {
    gridRings.push((RADIUS * g) / MAX_VALUE);
  }

  const axes = competencies.map((c, i) => {
    const angle = i * angleStep;
    const outer = polar(cx, cy, RADIUS, angle);
    const labelPos = polar(cx, cy, RADIUS + 26, angle);
    return { name: c.name, angle, outer, labelPos };
  });

  const polygons = series.map((s) => {
    const points = competencies
      .map((c, i) => {
        const value = s.averages[c.id] ?? 0;
        const r = (RADIUS * Math.max(0, Math.min(MAX_VALUE, value))) / MAX_VALUE;
        const p = polar(cx, cy, r, i * angleStep);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ");
    return { teamId: s.teamId, teamName: s.teamName, color: s.color, points };
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        style={{ maxWidth: 520, display: "block", margin: "0 auto" }}
      >
        {gridRings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--graph-grid)"
            strokeWidth={0.75}
          />
        ))}

        {axes.map((axis, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={axis.outer.x}
            y2={axis.outer.y}
            stroke="var(--graph-grid)"
            strokeWidth={0.75}
          />
        ))}

        {polygons.map((poly) => (
          <polygon
            key={poly.teamId}
            points={poly.points}
            fill={poly.color}
            fillOpacity={0.15}
            stroke={poly.color}
            strokeWidth={2}
          />
        ))}

        {axes.map((axis, i) => (
          <text
            key={i}
            x={axis.labelPos.x}
            y={axis.labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="var(--text)"
            fontFamily="var(--font-inter), sans-serif"
          >
            {axis.name}
          </text>
        ))}

        <circle cx={cx} cy={cy} r={3} fill="var(--text-muted)" />
      </svg>

      <div className="legend">
        {series.map((s) => (
          <span key={s.teamId}>
            <span className="sw" style={{ background: s.color }} />
            {s.teamName}
          </span>
        ))}
      </div>
    </div>
  );
}
