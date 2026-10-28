import { notFound } from "next/navigation";
import { getEvaluationById } from "@/lib/data/scoutingEvaluations";
import { KPIS_PERIODICAS, KPIS_POR_JOGO, bandaParaValor, scorePonderado } from "@/lib/scouting-kpi/kpiData";
import { PrintButton } from "@/components/print/PrintButton";

export const dynamic = "force-dynamic";

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

      {evaluation.cadence === "POR_JOGO" && ctx ? (
        <section className="kpi-print-context">
          <h2>Contexto do jogo</h2>
          <dl className="kpi-print-meta">
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

      <table>
        <thead>
          <tr>
            <th>Competência</th>
            <th>Peso</th>
            <th>Pontuação</th>
            <th>Banda</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => {
            const value = evaluation.scores[kpi.id] ?? 0;
            const banda = bandaParaValor(value);
            return (
              <tr key={kpi.id}>
                <td>{kpi.name}</td>
                <td>{kpi.peso}</td>
                <td>{value}</td>
                <td>{banda?.label ?? "—"}</td>
              </tr>
            );
          })}
          <tr className="avg">
            <td colSpan={2}>Score ponderado</td>
            <td colSpan={2}>{score.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>

      <section className="kpi-print-notes">
        <h2>Notas</h2>
        {evaluation.notas && <p>{evaluation.notas}</p>}
        <div className="kpi-print-handwrite" aria-hidden="true" />
      </section>

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
