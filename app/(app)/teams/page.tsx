import { listTeams } from "@/lib/data/teams";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import { TeamList } from "@/components/teams/TeamList";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await listTeams();

  return (
    <>
      <PageHeader
        title="Perfil de Desempenho Psicológico"
        subtitle="Gere as equipas e acede ao perfil individual ou coletivo de cada atleta."
      />
      <div className="layout">
        <div>
          <Panel title="Nova equipa">
            <CreateTeamForm />
          </Panel>
        </div>
        <div>
          <Panel title="Equipas">
            <TeamList teams={teams} />
          </Panel>
        </div>
      </div>
    </>
  );
}
