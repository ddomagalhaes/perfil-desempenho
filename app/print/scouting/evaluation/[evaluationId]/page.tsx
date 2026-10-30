import { notFound } from "next/navigation";
import { getEvaluationById, type EvaluationHalf } from "@/lib/data/scoutingEvaluations";
import { BANDAS_GERAIS, KPIS_PERIODICAS, KPIS_POR_JOGO, bandaParaValor, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import type { Kpi } from "@/lib/scouting-kpi/types";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";

export const dynamic = "force-dynamic";

function DeltaText({ value }: { value: number | null }) {
  if (value === null) return <span className="pdf-delta">—</span>;
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span className="pdf-delta">▬ 0,0</span>;
  const up = rounded > 0;
  // Seta + sinal, nunca só cor — tem de se ler bem a preto e branco.
  return (
    <span className={up ? "pdf-delta pdf-delta-up" : "pdf-delta pdf-delta-down"}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {rounded.toFixed(1)}
    </span>
  );
}

function ScoreTable({ title, half, kpis }: { title: string; half: EvaluationHalf; kpis: Kpi[] }) {
  const score = scorePonderado(kpis, half.scores);
  const previousScore = half.previousScores ? scorePonderado(kpis, half.previousScores) : null;
  const scoreDelta = previousScore !== null ? score - previousScore : null;
  const banda = bandaParaValor(score);

  return (
    <div className="pdf-score-table">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Competência</th>
            <th>Peso</th>
            <th>Pontuação</th>
            <th>Banda</th>
            <th>Variação</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => {
            const value = half.scores[kpi.id] ?? 0;
            const kpiBanda = bandaParaValor(value);
            const prevValue = half.previousScores?.[kpi.id];
            const delta = prevValue !== undefined ? value - prevValue : null;
            return (
              <tr key={kpi.id}>
                <td>{kpi.name}</td>
                <td>{kpi.peso}</td>
                <td>{value}</td>
                <td>{kpiBanda?.label ?? "—"}</td>
                <td>
                  <DeltaText value={delta} />
                </td>
              </tr>
            );
          })}
          <tr className="avg">
            <td colSpan={2}>Score ponderado</td>
            <td colSpan={2}>
              {score.toFixed(1)}
              {banda && <span className="pdf-score-banda"> · {banda.label}</span>}
            </td>
            <td>
              <DeltaText value={scoreDelta} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ label, half, kpis }: { label: string; half: EvaluationHalf; kpis: Kpi[] }) {
  const score = scorePonderado(kpis, half.scores);
  const previousScore = half.previousScores ? scorePonderado(kpis, half.previousScores) : null;
  const scoreDelta = previousScore !== null ? score - previousScore : null;

  return (
    <section className="pdf-summary-card">
      <h2>{label}</h2>
      <div className="pdf-summary-value">{score.toFixed(1)}</div>
      <DeltaText value={scoreDelta} />
      {previousScore === null && <p className="pdf-summary-hint">Primeira avaliação registada.</p>}
    </section>
  );
}

export default async function PrintScoutingEvaluationPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;
  const evaluation = await getEvaluationById(evaluationId);
  if (!evaluation) notFound();

  const { porJogo, periodica } = evaluation;
  const ctx = porJogo?.gameContext ?? null;
  const anchor = porJogo ?? periodica!;

  return (
    <div>
      <PrintButton />

      <PrintHeader
        eyebrow={`Scouting · Avaliação ${porJogo && periodica ? "por jogo + periódica" : porJogo ? "por jogo" : "periódica"}`}
        title={evaluation.prospectName}
        subtitle={`${evaluation.prospectPositionName ?? "Sem posição"} — avaliação de ${new Date(
          anchor.createdAt
        ).toLocaleDateString("pt-PT")}`}
        meta={evaluation.avaliador ? [{ label: "Avaliador", value: evaluation.avaliador }] : []}
      />

      <div className="pdf-cols">
        <div className="pdf-col-main">
          {porJogo && <ScoreTable title="Competências por jogo" half={porJogo} kpis={KPIS_POR_JOGO} />}
          {periodica && <ScoreTable title="Competências periódicas" half={periodica} kpis={KPIS_PERIODICAS} />}

          <section className="kpi-print-notes">
            <h2>Notas</h2>
            {evaluation.notas && <p>{evaluation.notas}</p>}
            <div className="kpi-print-handwrite" aria-hidden="true" />
          </section>

          <section className="pdf-legend">
            <h2>Escala de pontuação (0–10)</h2>
            <div className="pdf-legend-grid">
              {BANDAS_GERAIS.map((b) => (
                <div key={b.range}>
                  <strong>
                    {b.range} · {b.label}
                  </strong>
                  <span>{b.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="pdf-col-side">
          {ctx && (
            <section className="kpi-print-context">
              <h2>Contexto do jogo</h2>
              <dl className="kpi-print-meta pdf-meta-stacked">
                <div>
                  <dt>Adversário</dt>
                  <dd>{ctx.adversario || "—"}</dd>
                </div>
                <div>
                  <dt>Data do jogo</dt>
                  <dd>{ctx.data ? new Date(ctx.data).toLocaleDateString("pt-PT") : "—"}</dd>
                </div>
                <div>
                  <dt>Local</dt>
                  <dd>{ctx.casaOuFora}</dd>
                </div>
                <div>
                  <dt>Dificuldade</dt>
                  <dd>{ctx.dificuldade}</dd>
                </div>
                <div>
                  <dt>Resultado</dt>
                  <dd>{ctx.resultado}</dd>
                </div>
                <div>
                  <dt>Estatuto</dt>
                  <dd>
                    {ctx.titularOuSuplente}
                    {ctx.titularOuSuplente === "Suplente" && ctx.minutoEntrada != null
                      ? ` (entrou aos ${ctx.minutoEntrada}')`
                      : ""}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {periodica && (
            <section className="kpi-print-context">
              <h2>Período avaliado</h2>
              <p>{periodica.periodo || "Não especificado"}</p>
            </section>
          )}

          {porJogo && <SummaryCard label="Score ponderado — por jogo" half={porJogo} kpis={KPIS_POR_JOGO} />}
          {periodica && (
            <SummaryCard label="Score ponderado — periódica" half={periodica} kpis={KPIS_PERIODICAS} />
          )}
        </div>
      </div>

      <PrintFooter />
    </div>
  );
}
