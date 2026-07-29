import { notFound } from "next/navigation";
import { getTeam, getTeamAthletesGroupedByPosition, getTeamDetail } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { TeamStatsTable } from "@/components/teams/TeamStatsTable";
import { PrintButton } from "@/components/print/PrintButton";
import { areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function PrintTeamPage({
  params,
}: {
  params: Promise<{ area: string; teamId: string }>;
}) {
  const { area: areaParam, teamId } = await params;
  if (!isTeamAreaSlug(areaParam)) notFound();
  const area: TeamAreaSlug = areaParam;

  if (area === "technical") {
    const [team, groups] = await Promise.all([
      getTeam(teamId),
      getTeamAthletesGroupedByPosition(teamId),
    ]);
    if (!team) notFound();

    const athletes = groups.flatMap((g) => g.athletes);

    return (
      <div>
        <PrintButton />
        <h1>{team.name}</h1>
        <p style={{ color: "var(--text-muted)" }}>
          {athletes.length} atleta{athletes.length === 1 ? "" : "s"} — Técnico/Tático — médias
          calculadas por posição — gerado em {new Date().toLocaleDateString("pt-PT")}
        </p>
        {groups.length === 0 ? (
          <p className="empty">Sem atletas com posição atribuída.</p>
        ) : (
          groups.map((g) => (
            <div key={g.position?.id ?? "unassigned"} style={{ marginTop: 24 }}>
              <h2>
                {g.position ? g.position.name : "Sem posição definida"} ({g.athletes.length})
              </h2>
              {g.position ? (
                <>
                  <PerformanceWheel
                    competencies={g.competencies}
                    scores={Object.fromEntries(g.stats.map((s) => [s.competencyId, s.avg]))}
                  />
                  <TeamStatsTable
                    competencies={g.competencies}
                    athletes={g.athletes}
                    stats={g.stats}
                  />
                </>
              ) : (
                <p className="hint">Atletas sem posição atribuída, sem competências a mostrar.</p>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  const [team, competencies] = await Promise.all([
    getTeamDetail(teamId, areaTypeFromSlug(area)),
    getActiveCompetencies(areaTypeFromSlug(area)),
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
