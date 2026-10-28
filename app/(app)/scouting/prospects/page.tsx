import { listProspects } from "@/lib/data/prospects";
import { listPositions } from "@/lib/data/positions";
import { listAllAthletesForLinking } from "@/lib/data/athletes";
import { getOverviewStats } from "@/lib/data/overview";
import { AreaHero } from "@/components/layout/AreaHero";
import { AreaCards } from "@/components/layout/AreaCards";
import { ProspectManager } from "@/components/scouting/ProspectManager";
import { ExcelActions } from "@/components/scouting/ExcelActions";

export const dynamic = "force-dynamic";

export default async function ScoutingProspectsPage() {
  const [prospects, positions, athletes, stats] = await Promise.all([
    listProspects(),
    listPositions(),
    listAllAthletesForLinking(),
    getOverviewStats(),
  ]);

  return (
    <>
      <AreaHero
        label="Scouting"
        title="Prospetos"
        subtitle="Jogadores externos em observação e atletas já existentes ligados ao scouting."
        statValue={stats?.evaluations ?? "—"}
        statLabel="avaliações registadas"
        actions={<ExcelActions />}
      />
      <AreaCards active="scouting" />

      <ProspectManager prospects={prospects} positions={positions} athletes={athletes} />
    </>
  );
}
