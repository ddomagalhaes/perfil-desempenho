import { notFound } from "next/navigation";
import { getTeam, getTeamAthletesGroupedByPosition, getTeamDetail } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { TeamStatsTable } from "@/components/teams/TeamStatsTable";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";
import { AREA_LABELS, areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

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
        <PrintHeader
          eyebrow={`${AREA_LABELS[area]} · Equipa`}
          title={team.name}
          subtitle={`${athletes.length} atleta${athletes.length === 1 ? "" : "s"} — médias calculadas por posição`}
        />
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
        <PrintFooter />
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
      <PrintHeader
        eyebrow={`${AREA_LABELS[area]} · Equipa`}
        title={team.name}
        subtitle={`${team.athletes.length} atleta${team.athletes.length === 1 ? "" : "s"}`}
      />
      <PerformanceWheel competencies={competencies} scores={averages} />
      <TeamStatsTable competencies={competencies} athletes={team.athletes} stats={team.stats} />
      <PrintFooter />
    </div>
  );
}
