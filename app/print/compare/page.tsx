import { getTeamAverageSeries } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { RadarChart, RADAR_SERIES_COLORS } from "@/components/radar/RadarChart";
import { ComparisonTable } from "@/components/teams/ComparisonTable";
import { PrintButton } from "@/components/print/PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintComparePage({
  searchParams,
}: {
  searchParams: Promise<{ teams?: string }>;
}) {
  const { teams: teamsParam } = await searchParams;
  const selectedIds = teamsParam ? teamsParam.split(",").filter(Boolean) : [];

  const competencies = await getActiveCompetencies();
  const series = selectedIds.length > 0 ? await getTeamAverageSeries(selectedIds) : [];
  const coloredSeries = series.map((s, i) => ({
    ...s,
    color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
  }));

  return (
    <div>
      <PrintButton />
      <h1>Comparação de equipas</h1>
      <p style={{ color: "var(--text-muted)" }}>
        {coloredSeries.map((s) => s.teamName).join(" vs. ")} — gerado em{" "}
        {new Date().toLocaleDateString("pt-PT")}
      </p>
      {coloredSeries.length === 0 ? (
        <p className="empty">Nenhuma equipa selecionada.</p>
      ) : (
        <>
          <RadarChart competencies={competencies} series={coloredSeries} />
          <ComparisonTable competencies={competencies} series={coloredSeries} />
        </>
      )}
    </div>
  );
}
