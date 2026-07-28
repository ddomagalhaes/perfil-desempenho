import { notFound } from "next/navigation";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { CompetencyEditor } from "@/components/competencies/CompetencyEditor";
import { PositionManager } from "@/components/positions/PositionManager";
import { areaTypeFromSlug, isAreaSlug, type AreaSlug } from "@/lib/areas";
import type { CompetencyDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompetenciesPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaParam } = await params;
  if (!isAreaSlug(areaParam)) notFound();
  const area: AreaSlug = areaParam;

  if (area === "technical") {
    const positions = await listPositions();
    const competenciesByPosition: Record<string, CompetencyDTO[]> = {};
    await Promise.all(
      positions.map(async (p) => {
        competenciesByPosition[p.id] = await getPositionCompetencies(p.id);
      })
    );

    return (
      <>
        <PageHeader
          title="Posições"
          subtitle="Define as posições e as competências técnico-táticas de cada uma."
        />
        <PositionManager positions={positions} competenciesByPosition={competenciesByPosition} />
      </>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));

  return (
    <>
      <PageHeader title="Competências" subtitle="Lista partilhada por todas as equipas." />
      <Panel title="Competências psicológicas">
        <CompetencyEditor area={area} initialCompetencies={competencies} />
      </Panel>
    </>
  );
}
