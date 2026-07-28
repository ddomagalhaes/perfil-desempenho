import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetencyLegend } from "@/components/competencies/CompetencyLegend";

export const dynamic = "force-dynamic";

export default async function LegendPage() {
  const competencies = await getActiveCompetencies();

  return (
    <>
      <PageHeader
        title="Legenda"
        subtitle="Descrição de cada competência psicológica, para consulta rápida antes de pontuar."
      />
      <CompetencyLegend competencies={competencies} />
    </>
  );
}
