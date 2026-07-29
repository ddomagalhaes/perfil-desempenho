import { notFound } from "next/navigation";
import { getProspectDetail } from "@/lib/data/prospects";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProspectNoteEditor } from "@/components/scouting/ProspectNoteEditor";

export const dynamic = "force-dynamic";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  const { prospectId } = await params;

  const [prospect, kpis] = await Promise.all([
    getProspectDetail(prospectId),
    getActiveCompetencies("SCOUTING"),
  ]);
  if (!prospect) notFound();

  const details = [prospect.positionName ?? "Sem posição", prospect.club, prospect.athleteTeamName ? `atleta em ${prospect.athleteTeamName}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader title={prospect.name} subtitle={details} />
      <ProspectNoteEditor prospectId={prospect.id} kpis={kpis} initialNotes={prospect.notes} />
    </>
  );
}
