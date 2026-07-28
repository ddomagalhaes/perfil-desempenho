import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function upsertScore(athleteId: string, competencyId: string, value: number) {
  const clamped = Math.max(0, Math.min(10, Math.round(value)));
  await prisma.score.upsert({
    where: { athleteId_competencyId: { athleteId, competencyId } },
    create: { athleteId, competencyId, value: clamped },
    update: { value: clamped },
  });
  return clamped;
}
