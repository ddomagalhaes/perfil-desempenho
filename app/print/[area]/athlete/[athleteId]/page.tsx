import { notFound } from "next/navigation";
import { getAthleteDetail } from "@/lib/data/athletes";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies } from "@/lib/data/positions";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { ScoreList } from "@/components/athletes/ScoreList";
import { CompetencyLegend } from "@/components/competencies/CompetencyLegend";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";
import { AREA_LABELS, areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

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
          <PrintHeader eyebrow={`${AREA_LABELS[area]} · Atleta`} title={athlete.name} subtitle={athlete.teamName} />
          <p className="empty">Este atleta ainda não tem posição atribuída.</p>
          <PrintFooter />
        </div>
      );
    }

    const competencies = await getPositionCompetencies(athlete.positionId);

    return (
      <div>
        <PrintButton />
        <PrintHeader
          eyebrow={`${AREA_LABELS[area]} · Atleta`}
          title={athlete.name}
          subtitle={`${athlete.teamName} — ${athlete.positionName}`}
        />
        <PerformanceWheel competencies={competencies} scores={athlete.scores} />
        <ScoreList competencies={competencies} scores={athlete.scores} />
        <h2 style={{ marginTop: 32 }}>Legenda das competências — {athlete.positionName}</h2>
        <CompetencyLegend competencies={competencies} />
        <PrintFooter />
      </div>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));

  return (
    <div>
      <PrintButton />
      <PrintHeader eyebrow={`${AREA_LABELS[area]} · Atleta`} title={athlete.name} subtitle={athlete.teamName} />
      <PerformanceWheel competencies={competencies} scores={athlete.scores} />
      <ScoreList competencies={competencies} scores={athlete.scores} />
      <h2 style={{ marginTop: 32 }}>Legenda das competências</h2>
      <CompetencyLegend competencies={competencies} />
      <PrintFooter />
    </div>
  );
}
