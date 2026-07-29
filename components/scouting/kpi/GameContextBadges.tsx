import type { GameContext } from "@/lib/scouting-kpi/types";

interface Props {
  context: GameContext;
  onMinutoEntradaChange?: (minuto: number) => void;
}

// Estes campos vêm idealmente do Wyscout/dados da competição, associados ao jogo
// selecionado. O scout não os deve escolher manualmente — só o minuto de entrada
// fica editável, para os casos em que a fonte de dados não o fornece.
export function GameContextBadges({ context, onMinutoEntradaChange }: Props) {
  return (
    <div className="kpi-badges">
      <span className="kpi-badge">{context.posicao}</span>
      <span className="kpi-badge">Dificuldade: {context.dificuldade}</span>
      <span className="kpi-badge">{context.casaOuFora}</span>
      <span className="kpi-badge">{context.resultado}</span>
      <span className="kpi-badge">{context.titularOuSuplente}</span>
      {context.titularOuSuplente === "Suplente" && (
        <span className="kpi-badge">
          Entrou aos{" "}
          <input
            type="number"
            min={0}
            max={120}
            value={context.minutoEntrada ?? ""}
            onChange={(e) => onMinutoEntradaChange?.(Number(e.target.value))}
          />
          &apos;
        </span>
      )}
    </div>
  );
}
