import { notFound } from "next/navigation";
import { listTeams } from "@/lib/data/teams";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import { TeamList } from "@/components/teams/TeamList";
import { AREA_LABELS, isTeamAreaSlug, type TeamAreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaParam } = await params;
  if (!isTeamAreaSlug(areaParam)) notFound();
  const area: TeamAreaSlug = areaParam;

  const teams = await listTeams();

  return (
    <>
      <PageHeader
        title="Perfil de Desempenho"
        subtitle={`Gere as equipas e acede ao perfil de cada atleta — área ${AREA_LABELS[area]}.`}
      />
      <div className="layout">
        <div>
          <Panel title="Nova equipa">
            <CreateTeamForm />
          </Panel>
        </div>
        <div>
          <Panel title="Equipas">
            <TeamList area={area} teams={teams} />
          </Panel>
        </div>
      </div>
    </>
  );
}
