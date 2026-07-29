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

/** All athletes across every team, for the "adicionar atleta existente ao scouting"
 * picker — flags athletes that already have a scouting profile so the UI can hide or
 * disable them instead of creating a duplicate Prospect link. */
export async function listAllAthletesForLinking(): Promise<
  { id: string; name: string; teamName: string; alreadyLinked: boolean }[]
> {
  const athletes = await prisma.athlete.findMany({
    orderBy: [{ team: { name: "asc" } }, { sortOrder: "asc" }],
    include: { team: { select: { name: true } }, prospect: { select: { id: true } } },
  });
  return athletes.map((a) => ({
    id: a.id,
    name: a.name,
    teamName: a.team.name,
    alreadyLinked: a.prospect !== null,
  }));
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
