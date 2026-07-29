import { notFound } from "next/navigation";
import {
  getTeamAverageSeries,
  getTeamPositionAverageSeries,
  listTeams,
} from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { TeamSelector } from "@/components/compare/TeamSelector";
import { PositionSelector } from "@/components/compare/PositionSelector";
import { RadarChart, RADAR_SERIES_COLORS } from "@/components/radar/RadarChart";
import { ComparisonTable } from "@/components/teams/ComparisonTable";
import { areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ teams?: string; position?: string }>;
}) {
  const { area: areaParam } = await params;
  if (!isTeamAreaSlug(areaParam)) notFound();
  const area: TeamAreaSlug = areaParam;

  const { teams: teamsParam, position: positionParam } = await searchParams;
  const selectedTeamIds = teamsParam ? teamsParam.split(",").filter(Boolean) : [];

  if (area === "technical") {
    const [allTeams, positions] = await Promise.all([listTeams(), listPositions()]);
    const selectedPositionId =
      positionParam && positions.some((p) => p.id === positionParam) ? positionParam : null;

    const series =
      selectedPositionId && selectedTeamIds.length > 0
        ? await getTeamPositionAverageSeries(selectedTeamIds, selectedPositionId)
        : [];
    const coloredSeries = series.map((s, i) => ({
      ...s,
      color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
    }));
    const competencies = selectedPositionId
      ? await getPositionCompetencies(selectedPositionId)
      : [];
    const positionName = positions.find((p) => p.id === selectedPositionId)?.name;

    const printHref =
      selectedPositionId && selectedTeamIds.length > 0
        ? `/print/technical/compare?position=${selectedPositionId}&teams=${selectedTeamIds.join(",")}`
        : undefined;

    return (
      <>
        <PageHeader
          title="Comparar equipas"
          subtitle="Escolhe uma posição e depois as equipas a comparar."
          actions={
            printHref ? (
              <a className="print-actions" href={printHref} target="_blank" rel="noopener noreferrer">
                <button type="button">Exportar PDF</button>
              </a>
            ) : undefined
          }
        />
        <div className="layout">
          <div>
            <Panel title="Posição">
              <PositionSelector positions={positions} selectedId={selectedPositionId} />
            </Panel>
            <Panel title="Equipas">
              <TeamSelector area={area} teams={allTeams} selectedIds={selectedTeamIds} />
            </Panel>
          </div>
          <div>
            {!selectedPositionId ? (
              <p className="empty">Escolhe uma posição à esquerda.</p>
            ) : coloredSeries.length === 0 ? (
              <p className="empty">
                Escolhe pelo menos uma equipa para comparar os {positionName}.
              </p>
            ) : (
              <>
                <RadarChart competencies={competencies} series={coloredSeries} />
                <ComparisonTable competencies={competencies} series={coloredSeries} />
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  const [allTeams, competencies] = await Promise.all([
    listTeams(),
    getActiveCompetencies(areaTypeFromSlug(area)),
  ]);

  const series =
    selectedTeamIds.length > 0
      ? await getTeamAverageSeries(selectedTeamIds, areaTypeFromSlug(area))
      : [];
  const coloredSeries = series.map((s, i) => ({
    ...s,
    color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
  }));

  return (
    <>
      <PageHeader
        title="Comparar equipas"
        subtitle="Seleciona duas ou mais equipas para sobrepor as médias no radar."
        actions={
          coloredSeries.length > 0 ? (
            <a
              className="print-actions"
              href={`/print/psychological/compare?teams=${selectedTeamIds.join(",")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button type="button">Exportar PDF</button>
            </a>
          ) : undefined
        }
      />
      <div className="layout">
        <div>
          <Panel title="Equipas">
            <TeamSelector area={area} teams={allTeams} selectedIds={selectedTeamIds} />
          </Panel>
        </div>
        <div>
          {coloredSeries.length === 0 ? (
            <p className="empty">Seleciona pelo menos uma equipa à esquerda para comparar.</p>
          ) : (
            <>
              <RadarChart competencies={competencies} series={coloredSeries} />
              <ComparisonTable competencies={competencies} series={coloredSeries} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
