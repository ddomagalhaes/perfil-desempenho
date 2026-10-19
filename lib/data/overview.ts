import "server-only";
import { prisma } from "@/lib/db/prisma";

export type OverviewStats = {
  teams: number;
  athletes: number;
  prospects: number;
  evaluations: number;
  students: number;
};

/** Contagens para a página inicial. Devolve null se a base de dados falhar, para
 * a página inicial continuar a abrir (sem números) em vez de rebentar. */
export async function getOverviewStats(): Promise<OverviewStats | null> {
  try {
    const [teams, athletes, prospects, evaluations, students] = await Promise.all([
      prisma.team.count(),
      prisma.athlete.count(),
      prisma.prospect.count({ where: { archivedAt: null } }),
      prisma.scoutingEvaluation.count(),
      prisma.student.count({ where: { archivedAt: null } }),
    ]);
    return { teams, athletes, prospects, evaluations, students };
  } catch {
    return null;
  }
}
