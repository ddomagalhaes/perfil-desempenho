import { notFound } from "next/navigation";
import { getTeamAverageSeries, getTeamPositionAverageSeries } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { RadarChart, RADAR_SERIES_COLORS } from "@/components/radar/RadarChart";
import { ComparisonTable } from "@/components/teams/ComparisonTable";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";
import { AREA_LABELS, areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function PrintComparePage({
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
  const selectedIds = teamsParam ? teamsParam.split(",").filter(Boolean) : [];

  if (area === "technical") {
    const positions = await listPositions();
    const position = positions.find((p) => p.id === positionParam) ?? null;

    const competencies = position ? await getPositionCompetencies(position.id) : [];
    const series =
      position && selectedIds.length > 0
        ? await getTeamPositionAverageSeries(selectedIds, position.id)
        : [];
    const coloredSeries = series.map((s, i) => ({
      ...s,
      color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
    }));

    return (
      <div>
        <PrintButton />
        <PrintHeader
          eyebrow={`${AREA_LABELS[area]} · Comparação`}
          title={`Comparação de equipas — ${position ? position.name : "posição não escolhida"}`}
          subtitle={coloredSeries.map((s) => s.teamName).join(" vs. ") || undefined}
        />
        {coloredSeries.length === 0 ? (
          <p className="empty">Nenhuma posição/equipa selecionada.</p>
        ) : (
          <>
            <RadarChart competencies={competencies} series={coloredSeries} />
            <ComparisonTable competencies={competencies} series={coloredSeries} />
          </>
        )}
        <PrintFooter />
      </div>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));
  const series =
    selectedIds.length > 0 ? await getTeamAverageSeries(selectedIds, areaTypeFromSlug(area)) : [];
  const coloredSeries = series.map((s, i) => ({
    ...s,
    color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
  }));

  return (
    <div>
      <PrintButton />
      <PrintHeader
        eyebrow={`${AREA_LABELS[area]} · Comparação`}
        title="Comparação de equipas"
        subtitle={coloredSeries.map((s) => s.teamName).join(" vs. ") || undefined}
      />
      {coloredSeries.length === 0 ? (
        <p className="empty">Nenhuma equipa selecionada.</p>
      ) : (
        <>
          <RadarChart competencies={competencies} series={coloredSeries} />
          <ComparisonTable competencies={competencies} series={coloredSeries} />
        </>
      )}
      <PrintFooter />
    </div>
  );
}
