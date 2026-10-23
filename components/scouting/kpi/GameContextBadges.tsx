import type { GameContext } from "@/lib/scouting-kpi/types";

interface Props {
  context: GameContext;
  onChange: (patch: Partial<GameContext>) => void;
}

const DIFICULDADES: GameContext["dificuldade"][] = ["Alta", "Média", "Baixa"];
const CASA_OU_FORA: GameContext["casaOuFora"][] = ["Casa", "Fora"];
const RESULTADOS: GameContext["resultado"][] = ["Vitória", "Derrota", "Empate"];
const TITULAR_OU_SUPLENTE: GameContext["titularOuSuplente"][] = ["Titular", "Suplente"];

// TODO: quando houver integração com uma fonte de dados da competição (ex.
// Wyscout), estes campos passam a vir preenchidos automaticamente e só ficam
// editáveis para corrigir uma falha pontual da fonte. Por agora não há
// nenhuma fonte automática — é tudo preenchido à mão pelo scout.
export function GameContextBadges({ context, onChange }: Props) {
  return (
    <div className="kpi-context-fields">
      <div className="kpi-context-row">
        <label className="field">
          Adversário
          <input
            type="text"
            value={context.adversario}
            onChange={(e) => onChange({ adversario: e.target.value })}
            placeholder="Ex.: FC Exemplo"
          />
        </label>
        <label className="field">
          Data
          <input
            type="date"
            value={context.data}
            onChange={(e) => onChange({ data: e.target.value })}
          />
        </label>
      </div>

      <div className="kpi-badges">
        <span className="kpi-badge">
          <input
            type="text"
            value={context.posicao}
            onChange={(e) => onChange({ posicao: e.target.value })}
            className="kpi-badge-text"
          />
        </span>
        <span className="kpi-badge">
          Dificuldade{" "}
          <select
            value={context.dificuldade}
            onChange={(e) => onChange({ dificuldade: e.target.value as GameContext["dificuldade"] })}
          >
            {DIFICULDADES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </span>
        <span className="kpi-badge">
          <select
            value={context.casaOuFora}
            onChange={(e) => onChange({ casaOuFora: e.target.value as GameContext["casaOuFora"] })}
          >
            {CASA_OU_FORA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </span>
        <span className="kpi-badge">
          <select
            value={context.resultado}
            onChange={(e) => onChange({ resultado: e.target.value as GameContext["resultado"] })}
          >
            {RESULTADOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </span>
        <span className="kpi-badge">
          <select
            value={context.titularOuSuplente}
            onChange={(e) =>
              onChange({ titularOuSuplente: e.target.value as GameContext["titularOuSuplente"] })
            }
          >
            {TITULAR_OU_SUPLENTE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </span>
        {context.titularOuSuplente === "Suplente" && (
          <span className="kpi-badge">
            Entrou aos{" "}
            <input
              type="number"
              min={0}
              max={120}
              value={context.minutoEntrada ?? ""}
              onChange={(e) => onChange({ minutoEntrada: Number(e.target.value) })}
            />
            &apos;
          </span>
        )}
      </div>
    </div>
  );
}
