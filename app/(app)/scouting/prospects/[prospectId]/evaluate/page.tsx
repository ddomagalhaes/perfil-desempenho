import { notFound } from "next/navigation";
import { getProspectDetail } from "@/lib/data/prospects";
import { PageHeader } from "@/components/layout/PageHeader";
import { EvaluationTabs } from "@/components/scouting/kpi/EvaluationTabs";
import type { GameContext } from "@/lib/scouting-kpi/types";

export const dynamic = "force-dynamic";

export default async function ProspectEvaluatePage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  const { prospectId } = await params;
  const prospect = await getProspectDetail(prospectId);
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
      <PageHeader title={`Avaliar — ${prospect.name}`} subtitle={prospect.club ?? undefined} />
      <EvaluationTabs
        prospectId={prospect.id}
        jogadorNome={prospect.name}
        context={context}
        periodoLabel="últimos 5 jogos"
      />
    </>
  );
}
