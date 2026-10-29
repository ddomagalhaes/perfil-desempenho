export type CompetencyBarValue = { id: string; name: string; value: number };

/** Mini-barras 0-10 reutilizadas em qualquer parte aberta de uma ExpandableRow
 * que mostre scores por competência (página inicial, Psicológico, Técnico/Tático,
 * Prospetos, Histórico de avaliações). */
export function CompetencyBars({
  bars,
  emptyLabel = "Sem scores registados ainda.",
}: {
  bars: CompetencyBarValue[];
  emptyLabel?: string;
}) {
  if (bars.length === 0) {
    return <p className="athlete-open-empty">{emptyLabel}</p>;
  }
  return (
    <div className="athlete-bars">
      {bars.map((bar) => (
        <div className="athlete-bar-row" key={bar.id}>
          <span>{bar.name}</span>
          <span className="athlete-bar-track">
            <span className="athlete-bar-fill" style={{ width: `${(bar.value / 10) * 100}%` }} />
          </span>
          <span className="athlete-bar-value mono">{bar.value}/10</span>
        </div>
      ))}
    </div>
  );
}
