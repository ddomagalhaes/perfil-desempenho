import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function upsertScore(athleteId: string, competencyId: string, value: number) {
  const clamped = Math.max(0, Math.min(10, Math.round(value)));
  await prisma.$transaction([
    prisma.score.upsert({
      where: { athleteId_competencyId: { athleteId, competencyId } },
      create: { athleteId, competencyId, value: clamped },
      update: { value: clamped },
    }),
    // Cada gravação acrescenta um registo em vez de só atualizar o valor atual —
    // é a única fonte de dados para calcular uma tendência (+/-) mais tarde.
    prisma.scoreHistory.create({ data: { athleteId, competencyId, value: clamped } }),
  ]);
  return clamped;
}
