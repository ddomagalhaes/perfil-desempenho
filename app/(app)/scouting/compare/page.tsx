import { getProspectDetail, listProspects } from "@/lib/data/prospects";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/layout/Panel";
import { ProspectSelector } from "@/components/scouting/ProspectSelector";
import { ScoutingCompareTable } from "@/components/scouting/ScoutingCompareTable";
import type { ProspectDetailDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ScoutingComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const selectedIds = ids ? ids.split(",").filter(Boolean) : [];

  const [allProspects, kpis] = await Promise.all([
    listProspects(),
    getActiveCompetencies("SCOUTING"),
  ]);

  const details = (
    await Promise.all(selectedIds.map((id) => getProspectDetail(id)))
  ).filter((p): p is ProspectDetailDTO => p !== null);

  return (
    <>
      <PageHeader
        title="Comparar prospetos"
        subtitle="Seleciona dois ou mais prospetos para veres as notas de scouting lado a lado."
      />
      <div className="layout">
        <div>
          <Panel title="Prospetos">
            <ProspectSelector prospects={allProspects} selectedIds={selectedIds} />
          </Panel>
        </div>
        <div>
          {details.length === 0 ? (
            <p className="empty">Seleciona pelo menos um prospeto à esquerda para comparar.</p>
          ) : (
            <ScoutingCompareTable kpis={kpis} prospects={details} />
          )}
        </div>
      </div>
    </>
  );
}
