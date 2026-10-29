import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetencyLegendRows } from "@/components/competencies/CompetencyLegendRows";

export const dynamic = "force-dynamic";

export default async function ScoutingLegendPage() {
  const kpis = await getActiveCompetencies("SCOUTING");

  return (
    <>
      <PageHeader
        title="Legenda"
        subtitle="Descrição de cada KPI de scouting, para consulta rápida."
      />
      <CompetencyLegendRows competencies={kpis} />
    </>
  );
}
