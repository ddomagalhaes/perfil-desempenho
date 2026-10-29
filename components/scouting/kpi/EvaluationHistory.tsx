import type { EvaluationCadence } from "@/app/generated/prisma/enums";
import { KPIS, bandaParaValor, scorePonderado, KPIS_POR_JOGO, KPIS_PERIODICAS } from "@/lib/scouting-kpi/kpiData";
import type { EvaluationHistoryEntry } from "@/lib/data/scoutingEvaluations";
import { Delta } from "@/components/ui/Delta";
import { CompetencyBars } from "@/components/ui/CompetencyBars";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";

const CADENCE_LABEL: Record<EvaluationCadence, string> = {
  POR_JOGO: "Jogo",
  PERIODICA: "Período",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function CadenceCard({
  label,
  entries,
  kpis,
}: {
  label: string;
  entries: EvaluationHistoryEntry[];
  kpis: typeof KPIS_POR_JOGO;
}) {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length === 0) {
    return (
      <div className="hd-summary-card">
        <p className="hd-summary-label">{label}</p>
        <p className="empty" style={{ padding: "12px 0" }}>
          Sem avaliações ainda.
        </p>
      </div>
    );
  }
  const scores = sorted.map((e) => scorePonderado(kpis, e.scores));
  const latest = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;
  const delta = previous === null ? null : latest - previous;
  const banda = bandaParaValor(latest);

  return (
    <div className="hd-summary-card">
      <p className="hd-summary-label">{label}</p>
      <div className="hd-summary-value">
        {latest.toFixed(1)}
        {banda && <span className="kpi-score-banda"> · {banda.label}</span>}
      </div>
      <Delta value={delta} />
      <p className="hd-summary-meta">
        {sorted.length} avaliaç{sorted.length === 1 ? "ão" : "ões"}
      </p>
    </div>
  );
}

/** Rótulo "data e jogo" de uma avaliação — adversário para "por jogo" (gravado no
 * próprio registo, nunca inventado), período para "periódica". */
function entryLabel(entry: EvaluationHistoryEntry): string {
  const date = formatDate(entry.createdAt);
  if (entry.cadence === "POR_JOGO") {
    return entry.gameContext ? `${date} · vs ${entry.gameContext.adversario}` : date;
  }
  return entry.periodo ? `${date} · ${entry.periodo}` : date;
}

export function EvaluationHistory({ entries }: { entries: EvaluationHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="empty">Sem avaliações registadas ainda.</p>;
  }

  const porJogoEntries = entries.filter((e) => e.cadence === "POR_JOGO");
  const periodicaEntries = entries.filter((e) => e.cadence === "PERIODICA");

  // Mais recentes primeiro (listEvaluations já devolve por ordem decrescente),
  // com a variação calculada contra a avaliação anterior DA MESMA cadência —
  // nunca comparamos "por jogo" com "periódica".
  const rows = entries.map((entry, index) => {
    const kpis = entry.cadence === "POR_JOGO" ? KPIS_POR_JOGO : KPIS_PERIODICAS;
    const score = scorePonderado(kpis, entry.scores);
    const previousOfSameCadence = entries
      .slice(index + 1)
      .find((e) => e.cadence === entry.cadence);
    const delta = previousOfSameCadence
      ? score - scorePonderado(kpis, previousOfSameCadence.scores)
      : null;
    const bars = KPIS.map((kpi) => ({ id: kpi.id, name: kpi.name, value: entry.scores[kpi.id] }))
      .filter((b): b is { id: string; name: string; value: number } => b.value !== undefined);

    return { entry, score, delta, bars };
  });

  return (
    <div className="hd-layout">
      <div className="hd-table-wrap">
        <ExpandableRowGroup>
          {rows.map(({ entry, score, delta, bars }) => (
            <ExpandableRow
              key={entry.id}
              id={entry.id}
              closed={
                <div className="athlete-row-closed">
                  <div className="athlete-row-name">
                    <strong>{entryLabel(entry)}</strong>
                    <span className="athlete-row-meta">{CADENCE_LABEL[entry.cadence]}</span>
                  </div>
                  <div className="athlete-row-score">
                    <span className="athlete-row-score-label">Score ponderado</span>
                    <span className="athlete-row-score-value">{score.toFixed(1)}</span>
                    <Delta value={delta} />
                  </div>
                </div>
              }
              open={<CompetencyBars bars={bars} />}
            />
          ))}
        </ExpandableRowGroup>
      </div>

      <div className="hd-summary">
        <CadenceCard label="Score ponderado — por jogo" entries={porJogoEntries} kpis={KPIS_POR_JOGO} />
        <CadenceCard label="Score ponderado — periódica" entries={periodicaEntries} kpis={KPIS_PERIODICAS} />
      </div>
    </div>
  );
}
