import "dotenv/config";
import { prisma } from "@/lib/db/prisma";
import { KPIS } from "@/lib/scouting-kpi/kpiData";

// Preenche a lista de KPIs de texto livre em /scouting/kpis (tabela `competencies`,
// area SCOUTING) com os nomes dos 12 KPIs psicológicos ponderados de kpiData.ts.
//
// Aviso: esta lista (Competency, sem peso/cadência no schema) é independente do
// sistema de avaliação por jogo/periódica, que lê sempre diretamente de kpiData.ts
// e nunca desta tabela. Peso e cadência ficam só descritos em texto, dentro da
// descrição de cada entrada — não há nenhuma ligação viva entre as duas listas, por
// isso editar ou apagar aqui não afeta os formulários de avaliação, e uma alteração
// futura a kpiData.ts não se reflete aqui automaticamente.
function buildDescription(kpi: (typeof KPIS)[number]): string {
  const cadenciaLabel = kpi.cadence === "por_jogo" ? "por jogo" : "periódica";
  const criterios = [...kpi.criteriosVideo, ...kpi.criteriosAoVivo, ...kpi.criteriosInferencial];
  return `Peso ${kpi.peso} na avaliação ${cadenciaLabel}. Critérios: ${criterios.join("; ")}.`;
}

async function main() {
  const existing = await prisma.competency.count({
    where: { archivedAt: null, area: "SCOUTING" },
  });
  if (existing > 0) {
    console.log(`Já existem ${existing} KPIs de scouting ativos — seed ignorado.`);
    return;
  }

  await prisma.competency.createMany({
    data: KPIS.map((kpi, index) => ({
      name: kpi.name,
      description: buildDescription(kpi),
      area: "SCOUTING",
      sortOrder: index,
    })),
  });

  console.log(`Criados ${KPIS.length} KPIs de scouting.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
