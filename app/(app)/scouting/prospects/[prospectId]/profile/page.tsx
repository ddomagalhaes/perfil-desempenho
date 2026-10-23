import Link from "next/link";
import { notFound } from "next/navigation";
import { getProspectDetail } from "@/lib/data/prospects";
import { getProspectProfile } from "@/lib/data/scoutingEvaluations";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProspectProfile } from "@/components/scouting/kpi/ProspectProfile";

export const dynamic = "force-dynamic";

export default async function ProspectProfilePage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  const { prospectId } = await params;
  const [prospect, profile] = await Promise.all([
    getProspectDetail(prospectId),
    getProspectProfile(prospectId),
  ]);
  if (!prospect) notFound();

  return (
    <>
      <PageHeader
        title={`Perfil — ${prospect.name}`}
        subtitle={prospect.club ?? undefined}
        actions={
          <Link href={`/scouting/prospects/${prospect.id}/evaluate`} className="primary">
            Avaliar
          </Link>
        }
      />
      <ProspectProfile profile={profile} />
    </>
  );
}
