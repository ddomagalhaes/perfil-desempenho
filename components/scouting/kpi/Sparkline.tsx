interface Props {
  values: number[];
  max?: number;
  width?: number;
  height?: number;
}

/** Mini-gráfico de tendência inline (0-10 por omissão). Sem biblioteca de
 * gráficos — segue o mesmo padrão de SVG à mão do RadarChart/PerformanceWheel. */
export function Sparkline({ values, max = 10, width = 120, height = 28 }: Props) {
  if (values.length < 2) {
    // Precisa de pelo menos 2 pontos para desenhar uma tendência; o número de
    // avaliações já aparece na legenda à volta deste componente.
    return <span className="sparkline-empty">— sem tendência ainda</span>;
  }

  const step = width / (values.length - 1);
  const y = (v: number) => height - (Math.max(0, Math.min(max, v)) / max) * height;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const lastY = y(values[values.length - 1]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="sparkline">
      <polyline points={points} />
      <circle cx={width} cy={lastY} r={2.4} />
    </svg>
  );
}
