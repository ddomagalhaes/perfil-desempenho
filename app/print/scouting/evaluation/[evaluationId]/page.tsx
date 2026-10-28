import { notFound } from "next/navigation";
import { getEvaluationById } from "@/lib/data/scoutingEvaluations";
import { KPIS_PERIODICAS, KPIS_POR_JOGO, bandaParaValor, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import { PrintButton } from "@/components/print/PrintButton";

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

export default async function PrintScoutingEvaluationPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;
  const evaluation = await getEvaluationById(evaluationId);
  if (!evaluation) notFound();

  const kpis = evaluation.cadence === "POR_JOGO" ? KPIS_POR_JOGO : KPIS_PERIODICAS;
  const score = scorePonderado(kpis, evaluation.scores);
  const previousScore = evaluation.previousScores ? scorePonderado(kpis, evaluation.previousScores) : null;
  const scoreDelta = previousScore !== null ? score - previousScore : null;
  const banda = bandaParaValor(score);
  const ctx = evaluation.gameContext;
  const geradoEm = new Date();

  return (
    <div>
      <PrintButton />

      <header className="kpi-print-header">
        <h1>{evaluation.prospectName}</h1>
        <p>
          {evaluation.prospectPositionName ?? "Sem posição"} — avaliação de{" "}
          {new Date(evaluation.createdAt).toLocaleDateString("pt-PT")}
          {evaluation.avaliador && ` — avaliador: ${evaluation.avaliador}`}
        </p>
      </header>

      <div className="pdf-cols">
        <div className="pdf-col-main">
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
                const value = evaluation.scores[kpi.id] ?? 0;
                const kpiBanda = bandaParaValor(value);
                const prevValue = evaluation.previousScores?.[kpi.id];
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

          <section className="kpi-print-notes">
            <h2>Notas</h2>
            {evaluation.notas && <p>{evaluation.notas}</p>}
            <div className="kpi-print-handwrite" aria-hidden="true" />
          </section>
        </div>

        <div className="pdf-col-side">
          {evaluation.cadence === "POR_JOGO" && ctx ? (
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
          ) : (
            <section className="kpi-print-context">
              <h2>Período avaliado</h2>
              <p>{evaluation.periodo || "Não especificado"}</p>
            </section>
          )}

          <section className="pdf-summary-card">
            <h2>Score ponderado</h2>
            <div className="pdf-summary-value">{score.toFixed(1)}</div>
            <DeltaText value={scoreDelta} />
            {previousScore === null && <p className="pdf-summary-hint">Primeira avaliação registada.</p>}
          </section>
        </div>
      </div>

      <footer className="kpi-print-footer">
        <p>
          Gerado em {geradoEm.toLocaleDateString("pt-PT")} às{" "}
          {geradoEm.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · Documento
          confidencial
        </p>
      </footer>
    </div>
  );
}
