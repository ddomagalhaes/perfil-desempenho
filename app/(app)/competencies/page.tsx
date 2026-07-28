import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { CompetencyEditor } from "@/components/competencies/CompetencyEditor";

export const dynamic = "force-dynamic";

export default async function CompetenciesPage() {
  const competencies = await getActiveCompetencies();

  return (
    <>
      <PageHeader title="Competências" subtitle="Lista partilhada por todas as equipas." />
      <Panel title="Competências psicológicas">
        <CompetencyEditor initialCompetencies={competencies} />
      </Panel>
    </>
  );
}
