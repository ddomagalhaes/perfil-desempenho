import Link from "next/link";
import { notFound } from "next/navigation";
import { getProspectDetail } from "@/lib/data/prospects";
import { listEvaluations } from "@/lib/data/scoutingEvaluations";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { EvaluationTabs } from "@/components/scouting/kpi/EvaluationTabs";
import { EvaluationHistory } from "@/components/scouting/kpi/EvaluationHistory";
import type { GameContext } from "@/lib/scouting-kpi/types";

export const dynamic = "force-dynamic";

export default async function ProspectEvaluatePage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  const { prospectId } = await params;
  const [prospect, history] = await Promise.all([
    getProspectDetail(prospectId),
    listEvaluations(prospectId),
  ]);
  if (!prospect) notFound();

  // TODO: não existe ainda um modelo de "jogo" na base de dados — quando a
  // integração com a fonte de dados da competição (ex. Wyscout) estiver
  // pronta, este contexto passa a vir de lá em vez de ser fixo.
  const context: GameContext = {
    jogoId: "mock",
    adversario: "Por definir",
    data: new Date().toISOString().slice(0, 10),
    posicao: prospect.positionName ?? "Sem posição",
    dificuldade: "Média",
    casaOuFora: "Casa",
    resultado: "Vitória",
    titularOuSuplente: "Titular",
  };

  return (
    <>
      <PageHeader
        title={`Avaliar — ${prospect.name}`}
        subtitle={prospect.club ?? undefined}
        actions={
          <>
            <Link href={`/scouting/prospects/${prospect.id}/profile`}>
              <button type="button">Ver perfil</button>
            </Link>
            <Link href="/scouting/kpis-referencia">
              <button type="button">Ver referência de KPIs</button>
            </Link>
          </>
        }
      />
      <EvaluationTabs
        prospectId={prospect.id}
        jogadorNome={prospect.name}
        context={context}
        periodoLabel="últimos 5 jogos"
      />
      <Panel title="Histórico de avaliações">
        <EvaluationHistory entries={history} />
      </Panel>
    </>
  );
}
