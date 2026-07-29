import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthleteDetail } from "@/lib/data/athletes";
import { getActiveCompetencies } from "@/lib/data/competencies";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { PageHeader } from "@/components/layout/PageHeader";
import { AthleteScoreEditor } from "@/components/athletes/AthleteScoreEditor";
import { PositionPicker } from "@/components/athletes/PositionPicker";
import { areaTypeFromSlug, isAreaSlug, type AreaSlug } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function AthletePage({
  params,
}: {
  params: Promise<{ area: string; teamId: string; athleteId: string }>;
}) {
  const { area: areaParam, teamId, athleteId } = await params;
  if (!isAreaSlug(areaParam)) notFound();
  const area: AreaSlug = areaParam;

  const athlete = await getAthleteDetail(athleteId);
  if (!athlete || athlete.teamId !== teamId) notFound();

  const breadcrumbs = (
    <nav className="breadcrumbs">
      <Link href={`/${area}/teams`}>Equipas</Link> {" / "}
      <Link href={`/${area}/teams/${teamId}`}>{athlete.teamName}</Link>
    </nav>
  );

  const exportButton = (
    <a
      className="print-actions"
      href={`/print/${area}/athlete/${athleteId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <button type="button">Exportar PDF</button>
    </a>
  );

  if (area === "technical") {
    const positions = await listPositions();

    if (!athlete.positionId) {
      return (
        <>
          {breadcrumbs}
          <PageHeader title={athlete.name} subtitle={athlete.teamName} />
          <p className="empty">
            Atribui uma posição a {athlete.name} para poderes pontuar a área Técnico/Tático.
          </p>
          <div className="row">
            <PositionPicker athleteId={athleteId} positions={positions} currentPositionId={null} />
          </div>
        </>
      );
    }

    const competencies = await getPositionCompetencies(athlete.positionId);

    return (
      <>
        {breadcrumbs}
        <PageHeader
          title={athlete.name}
          subtitle={`${athlete.teamName} — ${athlete.positionName}`}
          actions={exportButton}
        />
        <div className="row" style={{ marginBottom: 8 }}>
          <PositionPicker
            athleteId={athleteId}
            positions={positions}
            currentPositionId={athlete.positionId}
          />
        </div>
        <AthleteScoreEditor
          athleteId={athleteId}
          competencies={competencies}
          initialScores={athlete.scores}
        />
      </>
    );
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(area));

  return (
    <>
      {breadcrumbs}
      <PageHeader title={athlete.name} subtitle={athlete.teamName} actions={exportButton} />
      <AthleteScoreEditor
        athleteId={athleteId}
        competencies={competencies}
        initialScores={athlete.scores}
      />
    </>
  );
}
