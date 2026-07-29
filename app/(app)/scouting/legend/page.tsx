import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetencyLegend } from "@/components/competencies/CompetencyLegend";

export const dynamic = "force-dynamic";

export default async function ScoutingLegendPage() {
  const kpis = await getActiveCompetencies("SCOUTING");

  return (
    <>
      <PageHeader
        title="Legenda"
        subtitle="Descrição de cada KPI de scouting, para consulta rápida."
      />
      <CompetencyLegend competencies={kpis} />
    </>
  );
}
