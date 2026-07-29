import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { GameContext } from "@/lib/scouting-kpi/types";

export async function createPerGameEvaluation(input: {
  prospectId: string;
  scores: Record<string, number>;
  context: GameContext;
}): Promise<void> {
  await prisma.scoutingEvaluation.create({
    data: {
      prospectId: input.prospectId,
      cadence: "POR_JOGO",
      scores: input.scores,
      gameContext: input.context as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function createPeriodicEvaluation(input: {
  prospectId: string;
  scores: Record<string, number>;
  notas: string;
}): Promise<void> {
  await prisma.scoutingEvaluation.create({
    data: {
      prospectId: input.prospectId,
      cadence: "PERIODICA",
      scores: input.scores,
      notas: input.notas,
    },
  });
}
