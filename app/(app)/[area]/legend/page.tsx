import { notFound } from "next/navigation";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetencyLegend } from "@/components/competencies/CompetencyLegend";
import { areaTypeFromSlug, isAreaSlug, type AreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function LegendPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaParam } = await params;
  if (!isAreaSlug(areaParam)) notFound();
  const area: AreaSlug = areaParam;

  if (area === "technical") {
    const positions = await listPositions();
    const competenciesByPosition = await Promise.all(
      positions.map(async (p) => ({ position: p, competencies: await getPositionCompetencies(p.id) }))
    );

    return (
      <>
        <PageHeader
          title="Legenda"
          subtitle="Descrição das competências técnico-táticas de cada posição."
        />
        {competenciesByPosition.length === 0 ? (
          <p className="empty">Sem posições configuradas ainda.</p>
        ) : (
          competenciesByPosition.map(({ position, competencies }) => (
            <div className="panel" key={position.id}>
              <h2>{position.name}</h2>
              <CompetencyLegend competencies={competencies} />
            </div>
          ))
        )}
      </>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));

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
