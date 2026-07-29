import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamAthletesGroupedByPosition, getTeamDetail } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { listPositions } from "@/lib/data/positions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { AthleteList } from "@/components/teams/AthleteList";
import { TeamStatsTable } from "@/components/teams/TeamStatsTable";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";
import { AREA_LABELS, areaTypeFromSlug, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ area: string; teamId: string }>;
}) {
  const { area: areaParam, teamId } = await params;
  if (!isTeamAreaSlug(areaParam)) notFound();
  const area: TeamAreaSlug = areaParam;

  const printHref = `/print/${area}/team/${teamId}`;
  const exportButton = (
    <a className="print-actions" href={printHref} target="_blank" rel="noopener noreferrer">
      <button type="button">Exportar PDF</button>
    </a>
  );

  if (area === "technical") {
    const [team, groups, positions] = await Promise.all([
      getTeam(teamId),
      getTeamAthletesGroupedByPosition(teamId),
      listPositions(),
    ]);
    if (!team) notFound();

    const athletes = groups.flatMap((g) => g.athletes);

    return (
      <>
        <nav className="breadcrumbs">
          <Link href={`/${area}/teams`}>← Equipas</Link>
        </nav>
        <PageHeader
          title={team.name}
          subtitle={`${athletes.length} atleta${athletes.length === 1 ? "" : "s"} — ${AREA_LABELS[area]}`}
          actions={exportButton}
        />
        <div className="layout">
          <div>
            <Panel title="Atletas">
              <AthleteList area={area} teamId={teamId} athletes={athletes} positions={positions} />
            </Panel>
          </div>
          <div>
            {groups.length === 0 ? (
              <p className="empty">
                Adiciona atletas e atribui-lhes uma posição para veres os resultados técnicos.
              </p>
            ) : (
              groups.map((g) => (
                <div className="panel" key={g.position?.id ?? "unassigned"}>
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
                    <p className="hint">
                      Atribui uma posição a estes atletas (painel à esquerda) para veres os
                      resultados técnicos deles aqui.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  const [team, competencies] = await Promise.all([
    getTeamDetail(teamId, areaTypeFromSlug(area)),
    getActiveCompetencies(areaTypeFromSlug(area)),
  ]);
  if (!team) notFound();

  const averages = Object.fromEntries(team.stats.map((s) => [s.competencyId, s.avg]));

  return (
    <>
      <nav className="breadcrumbs">
        <Link href={`/${area}/teams`}>← Equipas</Link>
      </nav>
      <PageHeader
        title={team.name}
        subtitle={`${team.athletes.length} atleta${team.athletes.length === 1 ? "" : "s"}`}
        actions={exportButton}
      />
      <div className="layout">
        <div>
          <Panel title="Atletas">
            <AthleteList area={area} teamId={teamId} athletes={team.athletes} />
          </Panel>
        </div>
        <div>
          {team.athletes.length === 0 ? (
            <p className="empty">
              Adiciona atletas e pontua-os para veres os resultados de equipa.
            </p>
          ) : (
            <>
              <PerformanceWheel competencies={competencies} scores={averages} />
              <TeamStatsTable
                competencies={competencies}
                athletes={team.athletes}
                stats={team.stats}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
