import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AthleteDTO, ScoreMap } from "@/lib/types";

function scoresToMap(scores: { competencyId: string; value: number }[]): ScoreMap {
  const map: ScoreMap = {};
  for (const s of scores) map[s.competencyId] = s.value;
  return map;
}

export async function createAthlete(teamId: string, name: string) {
  const count = await prisma.athlete.count({ where: { teamId } });
  return prisma.athlete.create({ data: { teamId, name: name.trim(), sortOrder: count } });
}

export async function renameAthlete(id: string, name: string) {
  return prisma.athlete.update({ where: { id }, data: { name: name.trim() } });
}

export async function deleteAthlete(id: string) {
  return prisma.athlete.delete({ where: { id } });
}

export async function setAthletePosition(id: string, positionId: string | null) {
  return prisma.athlete.update({ where: { id }, data: { positionId } });
}

export async function getAthleteDetail(
  athleteId: string
): Promise<(AthleteDTO & { teamName: string }) | null> {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: { scores: true, team: true, position: true },
  });
  if (!athlete) return null;

  return {
    id: athlete.id,
    teamId: athlete.teamId,
    name: athlete.name,
    teamName: athlete.team.name,
    positionId: athlete.positionId,
    positionName: athlete.position?.name ?? null,
    scores: scoresToMap(athlete.scores),
  };
}
