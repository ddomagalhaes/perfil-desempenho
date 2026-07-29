import { listProspects } from "@/lib/data/prospects";
import { listPositions } from "@/lib/data/positions";
import { listAllAthletesForLinking } from "@/lib/data/athletes";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProspectManager } from "@/components/scouting/ProspectManager";
import { ExcelActions } from "@/components/scouting/ExcelActions";

export const dynamic = "force-dynamic";

export default async function ScoutingProspectsPage() {
  const [prospects, positions, athletes] = await Promise.all([
    listProspects(),
    listPositions(),
    listAllAthletesForLinking(),
  ]);

  return (
    <>
      <PageHeader
        title="Prospetos"
        subtitle="Jogadores externos em observação e atletas já existentes ligados ao scouting."
        actions={<ExcelActions />}
      />
      <ProspectManager prospects={prospects} positions={positions} athletes={athletes} />
    </>
  );
}
