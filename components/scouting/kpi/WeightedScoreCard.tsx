import { bandaParaValor } from "@/lib/scouting-kpi/kpiData";

interface Props {
  label: string; // e.g. "Score ponderado (por jogo)"
  value: number;
}

export function WeightedScoreCard({ label, value }: Props) {
  const banda = bandaParaValor(value);
  return (
    <div className="kpi-score-card">
      <span className="label">{label}</span>
      <span className="value">
        {value.toFixed(1)}
        {banda && <span className="kpi-score-banda"> · {banda.label}</span>}
      </span>
    </div>
  );
}
