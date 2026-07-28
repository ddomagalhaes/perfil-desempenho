import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/data/teams";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { AthleteList } from "@/components/teams/AthleteList";
import { TeamStatsTable } from "@/components/teams/TeamStatsTable";
import { PerformanceWheel } from "@/components/wheel/PerformanceWheel";

export const dynamic = "force-dynamic";

export default async function TeamPage({
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
    <>
      <nav className="breadcrumbs">
        <Link href="/teams">← Equipas</Link>
      </nav>
      <PageHeader
        title={team.name}
        subtitle={`${team.athletes.length} atleta${team.athletes.length === 1 ? "" : "s"}`}
        actions={
          <a
            className="print-actions"
            href={`/print/team/${teamId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button">Exportar PDF</button>
          </a>
        }
      />
      <div className="layout">
        <div>
          <Panel title="Atletas">
            <AthleteList teamId={teamId} athletes={team.athletes} />
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
