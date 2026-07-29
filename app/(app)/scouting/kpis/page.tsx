import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { CompetencyEditor } from "@/components/competencies/CompetencyEditor";

export const dynamic = "force-dynamic";

export default async function ScoutingKpisPage() {
  const kpis = await getActiveCompetencies("SCOUTING");

  return (
    <>
      <PageHeader
        title="KPIs de Scouting"
        subtitle="Lista de KPIs psicológicos usados para avaliar prospetos, independente das competências do perfil Psicológico."
      />
      <Panel title="KPIs">
        <CompetencyEditor area="scouting" initialCompetencies={kpis} />
      </Panel>
    </>
  );
}
