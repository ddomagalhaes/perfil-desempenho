import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { EvaluationCadence } from "@/app/generated/prisma/enums";
import type { GameContext } from "@/lib/scouting-kpi/types";

export type EvaluationHistoryEntry = {
  id: string;
  cadence: EvaluationCadence;
  scores: Record<string, number>;
  notas: string;
  createdAt: string;
};

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

/** Histórico de avaliações de scouting de um prospeto, mais recentes primeiro —
 * cada avaliação é um registo independente (uma por jogo/período), não um valor
 * único a substituir. */
export async function listEvaluations(prospectId: string): Promise<EvaluationHistoryEntry[]> {
  const rows = await prisma.scoutingEvaluation.findMany({
    where: { prospectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    cadence: r.cadence,
    scores: r.scores as Record<string, number>,
    notas: r.notas,
    createdAt: r.createdAt.toISOString(),
  }));
}
