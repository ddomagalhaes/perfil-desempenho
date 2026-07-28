import { getTeamAverageSeries, listTeams } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { TeamSelector } from "@/components/compare/TeamSelector";
import { RadarChart, RADAR_SERIES_COLORS } from "@/components/radar/RadarChart";
import { ComparisonTable } from "@/components/teams/ComparisonTable";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ teams?: string }>;
}) {
  const { teams: teamsParam } = await searchParams;
  const selectedIds = teamsParam ? teamsParam.split(",").filter(Boolean) : [];

  const [allTeams, competencies] = await Promise.all([listTeams(), getActiveCompetencies()]);

  const series = selectedIds.length > 0 ? await getTeamAverageSeries(selectedIds) : [];
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
              href={`/print/compare?teams=${selectedIds.join(",")}`}
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
            <TeamSelector teams={allTeams} selectedIds={selectedIds} />
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
