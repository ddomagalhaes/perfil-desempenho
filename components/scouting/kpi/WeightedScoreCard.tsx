interface Props {
  label: string; // e.g. "Score ponderado (por jogo)"
  value: number;
}

export function WeightedScoreCard({ label, value }: Props) {
  return (
    <div className="kpi-score-card">
      <span className="label">{label}</span>
      <span className="value">{value.toFixed(1)}</span>
    </div>
  );
}
