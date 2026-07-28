import { notFound } from "next/navigation";
import { getAthleteDetail } from "@/lib/data/athletes";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { ScoreList } from "@/components/athletes/ScoreList";
import { PrintButton } from "@/components/print/PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintAthletePage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const [athlete, competencies] = await Promise.all([
    getAthleteDetail(athleteId),
    getActiveCompetencies(),
  ]);
  if (!athlete) notFound();

  return (
    <div>
      <PrintButton />
      <h1>{athlete.name}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        {athlete.teamName} — gerado em {new Date().toLocaleDateString("pt-PT")}
      </p>
      <PerformanceWheel competencies={competencies} scores={athlete.scores} />
      <ScoreList competencies={competencies} scores={athlete.scores} />
    </div>
  );
}
