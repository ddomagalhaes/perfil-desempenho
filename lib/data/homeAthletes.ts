import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getActiveCompetencies } from "./competencies";
import { getPositionCompetencies } from "./positions";
import { getPreviousScores } from "./scoreHistory";

export type CompetencyBar = { competencyId: string; name: string; value: number };

export type AreaScoreSummary = {
  average: number | null;
  /** null = ainda sem histórico suficiente para calcular uma tendência (não é "0"). */
  trend: number | null;
  bars: CompetencyBar[];
};

export type ScoutingLink = {
  prospectId: string;
  /** null quando o atleta já está ligado ao scouting mas ainda não tem
   * nenhuma avaliação registada — nesse caso "Avaliar"/"Ver histórico" continuam
   * a fazer sentido, só "Gerar PDF" não tem nada para abrir. */
  lastEvaluation: { id: string; label: string } | null;
};

export type HomeAthleteRow = {
  id: string;
  name: string;
  teamName: string;
  positionName: string | null;
  psychological: AreaScoreSummary;
  technical: AreaScoreSummary;
  scouting: ScoutingLink | null;
};

function summarizeArea(
  scoresByCompetency: Map<string, number>,
  competencies: { id: string; name: string }[],
  previous: Map<string, number> | undefined
): AreaScoreSummary {
  const bars: CompetencyBar[] = competencies
    .map((c) => ({ competencyId: c.id, name: c.name, value: scoresByCompetency.get(c.id) }))
    .filter((b): b is CompetencyBar => b.value !== undefined);

  if (bars.length === 0) return { average: null, trend: null, bars: [] };

  const currentAvg = bars.reduce((sum, b) => sum + b.value, 0) / bars.length;

  let hasHistory = false;
  const previousValues = bars.map((b) => {
    const prev = previous?.get(b.competencyId);
    if (prev !== undefined) hasHistory = true;
    return prev ?? b.value;
  });
  const previousAvg = previousValues.reduce((sum, v) => sum + v, 0) / previousValues.length;

  return {
    average: Math.round(currentAvg * 10) / 10,
    trend: hasHistory ? Math.round((currentAvg - previousAvg) * 10) / 10 : null,
    bars,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

/** Lista de todos os atletas (de todas as equipas) com o resumo psicológico e
 * técnico/tático e, quando o atleta já está ligado a um prospeto de scouting
 * (lib/data/prospects.ts já suporta essa ligação), a última avaliação de
 * scouting registada — usada pela página inicial. */
export async function listHomeAthletes(): Promise<HomeAthleteRow[]> {
  const [athletes, psychCompetencies] = await Promise.all([
    prisma.athlete.findMany({
      orderBy: [{ team: { name: "asc" } }, { sortOrder: "asc" }],
      include: {
        team: { select: { name: true } },
        position: { select: { id: true, name: true } },
        scores: true,
        prospect: { select: { id: true } },
      },
    }),
    getActiveCompetencies("PSYCHOLOGICAL"),
  ]);

  const previousScores = await getPreviousScores(athletes.map((a) => a.id));

  const technicalCompetenciesByPosition = new Map<string, { id: string; name: string }[]>();
  for (const positionId of new Set(athletes.map((a) => a.positionId).filter((id): id is string => !!id))) {
    technicalCompetenciesByPosition.set(positionId, await getPositionCompetencies(positionId));
  }

  const prospectIds = athletes.map((a) => a.prospect?.id).filter((id): id is string => !!id);
  const latestEvaluationByProspect = new Map<
    string,
    { id: string; createdAt: Date; cadence: string; periodo: string; gameContext: unknown }
  >();
  if (prospectIds.length > 0) {
    const evaluations = await prisma.scoutingEvaluation.findMany({
      where: { prospectId: { in: prospectIds } },
      orderBy: { createdAt: "desc" },
    });
    for (const ev of evaluations) {
      if (!latestEvaluationByProspect.has(ev.prospectId)) {
        latestEvaluationByProspect.set(ev.prospectId, {
          id: ev.id,
          createdAt: ev.createdAt,
          cadence: ev.cadence,
          periodo: ev.periodo,
          gameContext: ev.gameContext,
        });
      }
    }
  }

  return athletes.map((athlete) => {
    const scoresByCompetency = new Map(athlete.scores.map((s) => [s.competencyId, s.value]));
    const previous = previousScores.get(athlete.id);

    const technicalCompetencies = athlete.positionId
      ? technicalCompetenciesByPosition.get(athlete.positionId) ?? []
      : [];

    const prospectId = athlete.prospect?.id;
    const latestEvaluation = prospectId ? latestEvaluationByProspect.get(prospectId) : undefined;
    const scouting: ScoutingLink | null = prospectId
      ? {
          prospectId,
          lastEvaluation: latestEvaluation
            ? {
                id: latestEvaluation.id,
                label:
                  latestEvaluation.cadence === "POR_JOGO"
                    ? `${formatDate(latestEvaluation.createdAt.toISOString())} · vs ${
                        (latestEvaluation.gameContext as { adversario?: string } | null)?.adversario ?? "—"
                      }`
                    : `${formatDate(latestEvaluation.createdAt.toISOString())} · ${latestEvaluation.periodo || "Periódica"}`,
              }
            : null,
        }
      : null;

    return {
      id: athlete.id,
      name: athlete.name,
      teamName: athlete.team.name,
      positionName: athlete.position?.name ?? null,
      psychological: summarizeArea(scoresByCompetency, psychCompetencies, previous),
      technical: summarizeArea(scoresByCompetency, technicalCompetencies, previous),
      scouting,
    };
  });
}
