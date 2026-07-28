import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AreaType } from "@/app/generated/prisma/enums";
import { getActiveCompetencies } from "./competencies";
import { getPositionCompetencies, listPositions } from "./positions";
import type {
  AthleteDTO,
  CompetencyDTO,
  CompetencyStatsDTO,
  PositionGroupDTO,
  ScoreMap,
  TeamAverageSeriesDTO,
  TeamDetailDTO,
  TeamSummaryDTO,
} from "@/lib/types";

function scoresToMap(scores: { competencyId: string; value: number }[]): ScoreMap {
  const map: ScoreMap = {};
  for (const s of scores) map[s.competencyId] = s.value;
  return map;
}

export function computeCompetencyStats(
  competencies: CompetencyDTO[],
  athletes: AthleteDTO[]
): CompetencyStatsDTO[] {
  return competencies.map((c) => {
    const values = athletes.map((a) => a.scores[c.id] ?? 0);
    const sum = values.reduce((s, v) => s + v, 0);
    const avg = values.length ? Math.round((sum / values.length) * 10) / 10 : 0;
    return {
      competencyId: c.id,
      name: c.name,
      avg,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  });
}

export async function listTeams(): Promise<TeamSummaryDTO[]> {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { athletes: true } } },
  });
  return teams.map((t) => ({ id: t.id, name: t.name, athleteCount: t._count.athletes }));
}

export async function createTeam(name: string) {
  return prisma.team.create({ data: { name: name.trim() } });
}

export async function renameTeam(id: string, name: string) {
  return prisma.team.update({ where: { id }, data: { name: name.trim() } });
}

export async function deleteTeam(id: string) {
  await prisma.team.delete({ where: { id } });
}

export async function getTeam(teamId: string): Promise<{ id: string; name: string } | null> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  return team ? { id: team.id, name: team.name } : null;
}

export async function getTeamAthletes(teamId: string): Promise<AthleteDTO[]> {
  const athletes = await prisma.athlete.findMany({
    where: { teamId },
    orderBy: { sortOrder: "asc" },
    include: { scores: true, position: true },
  });
  return athletes.map((a) => ({
    id: a.id,
    teamId: a.teamId,
    name: a.name,
    positionId: a.positionId,
    positionName: a.position?.name ?? null,
    scores: scoresToMap(a.scores),
  }));
}

export async function getTeamDetail(
  teamId: string,
  area: AreaType
): Promise<TeamDetailDTO | null> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;

  const [competencies, athletes] = await Promise.all([
    getActiveCompetencies(area),
    getTeamAthletes(teamId),
  ]);
  const stats = computeCompetencyStats(competencies, athletes);

  return { id: team.id, name: team.name, athletes, stats };
}

export async function getTeamAverageSeries(
  teamIds: string[],
  area: AreaType
): Promise<TeamAverageSeriesDTO[]> {
  const competencies = await getActiveCompetencies(area);
  const teams = await prisma.team.findMany({ where: { id: { in: teamIds } } });
  const byId = new Map(teams.map((t) => [t.id, t]));

  const series = await Promise.all(
    teamIds
      .filter((id) => byId.has(id))
      .map(async (id) => {
        const athletes = await getTeamAthletes(id);
        const stats = computeCompetencyStats(competencies, athletes);
        const averages: ScoreMap = {};
        stats.forEach((s) => {
          averages[s.competencyId] = s.avg;
        });
        return { teamId: id, teamName: byId.get(id)!.name, averages };
      })
  );

  return series;
}

/** Technical-area team view: one wheel/table group per position present in the team
 * (a straight team-wide average would mix incompatible competency sets). Athletes with
 * no position yet are returned in a `position: null` group. */
export async function getTeamAthletesGroupedByPosition(
  teamId: string
): Promise<PositionGroupDTO[]> {
  const [athletes, positions] = await Promise.all([getTeamAthletes(teamId), listPositions()]);

  const groups: PositionGroupDTO[] = [];

  for (const position of positions) {
    const positionAthletes = athletes.filter((a) => a.positionId === position.id);
    if (positionAthletes.length === 0) continue;
    const competencies = await getPositionCompetencies(position.id);
    const stats = computeCompetencyStats(competencies, positionAthletes);
    groups.push({ position, athletes: positionAthletes, stats, competencies });
  }

  const unassigned = athletes.filter((a) => !a.positionId);
  if (unassigned.length > 0) {
    groups.push({ position: null, athletes: unassigned, stats: [], competencies: [] });
  }

  return groups;
}

/** Technical-area comparison: restricts each team's athletes to one position and
 * computes averages over that position's own competencies, so every team in the
 * comparison is measured on the same axes. */
export async function getTeamPositionAverageSeries(
  teamIds: string[],
  positionId: string
): Promise<TeamAverageSeriesDTO[]> {
  const competencies = await getPositionCompetencies(positionId);
  const teams = await prisma.team.findMany({ where: { id: { in: teamIds } } });
  const byId = new Map(teams.map((t) => [t.id, t]));

  const series = await Promise.all(
    teamIds
      .filter((id) => byId.has(id))
      .map(async (id) => {
        const athletes = (await getTeamAthletes(id)).filter((a) => a.positionId === positionId);
        const stats = computeCompetencyStats(competencies, athletes);
        const averages: ScoreMap = {};
        stats.forEach((s) => {
          averages[s.competencyId] = s.avg;
        });
        return { teamId: id, teamName: byId.get(id)!.name, averages };
      })
  );

  return series;
}
