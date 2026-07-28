import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthleteDetail } from "@/lib/data/athletes";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { PageHeader } from "@/components/layout/PageHeader";
import { AthleteScoreEditor } from "@/components/athletes/AthleteScoreEditor";

export const dynamic = "force-dynamic";

export default async function AthletePage({
  params,
}: {
  params: Promise<{ teamId: string; athleteId: string }>;
}) {
  const { teamId, athleteId } = await params;
  const [athlete, competencies] = await Promise.all([
    getAthleteDetail(athleteId),
    getActiveCompetencies(),
  ]);
  if (!athlete || athlete.teamId !== teamId) notFound();

  return (
    <>
      <nav className="breadcrumbs">
        <Link href="/teams">Equipas</Link> {" / "}
        <Link href={`/teams/${teamId}`}>{athlete.teamName}</Link>
      </nav>
      <PageHeader
        title={athlete.name}
        subtitle={athlete.teamName}
        actions={
          <a
            className="print-actions"
            href={`/print/athlete/${athleteId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button">Exportar PDF</button>
          </a>
        }
      />
      <AthleteScoreEditor
        athleteId={athleteId}
        competencies={competencies}
        initialScores={athlete.scores}
      />
    </>
  );
}
