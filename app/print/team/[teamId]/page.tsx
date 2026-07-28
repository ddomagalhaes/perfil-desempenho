import { notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { TeamStatsTable } from "@/components/teams/TeamStatsTable";
import { PrintButton } from "@/components/print/PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [team, competencies] = await Promise.all([
    getTeamDetail(teamId),
    getActiveCompetencies(),
  ]);
  if (!team) notFound();

  const averages = Object.fromEntries(team.stats.map((s) => [s.competencyId, s.avg]));

  return (
    <div>
      <PrintButton />
      <h1>{team.name}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        {team.athletes.length} atleta{team.athletes.length === 1 ? "" : "s"} — gerado em{" "}
        {new Date().toLocaleDateString("pt-PT")}
      </p>
      <PerformanceWheel competencies={competencies} scores={averages} />
      <TeamStatsTable competencies={competencies} athletes={team.athletes} stats={team.stats} />
    </div>
  );
}
