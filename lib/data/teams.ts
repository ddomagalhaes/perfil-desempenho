import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getActiveCompetencies } from "./competencies";
import type {
  AthleteDTO,
  CompetencyDTO,
  CompetencyStatsDTO,
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

export async function getTeamAthletes(teamId: string): Promise<AthleteDTO[]> {
  const athletes = await prisma.athlete.findMany({
    where: { teamId },
    orderBy: { position: "asc" },
    include: { scores: true },
  });
  return athletes.map((a) => ({
    id: a.id,
    teamId: a.teamId,
    name: a.name,
    scores: scoresToMap(a.scores),
  }));
}

export async function getTeamDetail(teamId: string): Promise<TeamDetailDTO | null> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;

  const [competencies, athletes] = await Promise.all([
    getActiveCompetencies(),
    getTeamAthletes(teamId),
  ]);
  const stats = computeCompetencyStats(competencies, athletes);

  return { id: team.id, name: team.name, athletes, stats };
}

export async function getTeamAverageSeries(teamIds: string[]): Promise<TeamAverageSeriesDTO[]> {
  const competencies = await getActiveCompetencies();
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
