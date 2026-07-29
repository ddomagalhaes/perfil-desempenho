import { notFound } from "next/navigation";
import { getAthleteDetail } from "@/lib/data/athletes";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies } from "@/lib/data/positions";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { ScoreList } from "@/components/athletes/ScoreList";
import { CompetencyLegend } from "@/components/competencies/CompetencyLegend";
import { PrintButton } from "@/components/print/PrintButton";
import { areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function PrintAthletePage({
  params,
}: {
  params: Promise<{ area: string; athleteId: string }>;
}) {
  const { area: areaParam, athleteId } = await params;
  if (!isTeamAreaSlug(areaParam)) notFound();
  const area: TeamAreaSlug = areaParam;

  const athlete = await getAthleteDetail(athleteId);
  if (!athlete) notFound();

  if (area === "technical") {
    if (!athlete.positionId) {
      return (
        <div>
          <PrintButton />
          <h1>{athlete.name}</h1>
          <p style={{ color: "var(--text-muted)" }}>{athlete.teamName} — Técnico/Tático</p>
          <p className="empty">Este atleta ainda não tem posição atribuída.</p>
        </div>
      );
    }

    const competencies = await getPositionCompetencies(athlete.positionId);

    return (
      <div>
        <PrintButton />
        <h1>{athlete.name}</h1>
        <p style={{ color: "var(--text-muted)" }}>
          {athlete.teamName} — {athlete.positionName} — gerado em{" "}
          {new Date().toLocaleDateString("pt-PT")}
        </p>
        <PerformanceWheel competencies={competencies} scores={athlete.scores} />
        <ScoreList competencies={competencies} scores={athlete.scores} />
        <h2 style={{ marginTop: 32 }}>Legenda das competências — {athlete.positionName}</h2>
        <CompetencyLegend competencies={competencies} />
      </div>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));

  return (
    <div>
      <PrintButton />
      <h1>{athlete.name}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        {athlete.teamName} — gerado em {new Date().toLocaleDateString("pt-PT")}
      </p>
      <PerformanceWheel competencies={competencies} scores={athlete.scores} />
      <ScoreList competencies={competencies} scores={athlete.scores} />
      <h2 style={{ marginTop: 32 }}>Legenda das competências</h2>
      <CompetencyLegend competencies={competencies} />
    </div>
  );
}
