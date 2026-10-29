/** Variação com seta + sinal sempre em texto (nunca só cor) — "sem histórico
 * ainda" e "0,0" são estados diferentes e não devem ser confundidos. */
export function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="hd-delta hd-delta-flat">—</span>;
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span className="hd-delta hd-delta-flat">0,0</span>;
  const up = rounded > 0;
  return (
    <span className={up ? "hd-delta hd-delta-up" : "hd-delta hd-delta-down"}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {rounded.toFixed(1)}
    </span>
  );
}
