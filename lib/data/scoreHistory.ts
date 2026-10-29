import "server-only";
import { prisma } from "@/lib/db/prisma";

/** Para cada atleta, o valor imediatamente anterior ao atual de cada competência
 * que já tem pelo menos 2 registos em ScoreHistory. Um par atleta+competência
 * sem entrada no mapa devolvido significa "ainda sem histórico suficiente" —
 * nunca deve ser lido como "sem variação". */
export async function getPreviousScores(
  athleteIds: string[]
): Promise<Map<string, Map<string, number>>> {
  const result = new Map<string, Map<string, number>>();
  if (athleteIds.length === 0) return result;

  const rows = await prisma.scoreHistory.findMany({
    where: { athleteId: { in: athleteIds } },
    orderBy: { recordedAt: "desc" },
    select: { athleteId: true, competencyId: true, value: true },
  });

  const seenMostRecent = new Set<string>();
  for (const row of rows) {
    const key = `${row.athleteId}:${row.competencyId}`;
    if (!seenMostRecent.has(key)) {
      // Esta é a gravação mais recente (a mesma que já está em Score) — não é
      // o "anterior", só marca que a já vimos para reconhecer a seguinte.
      seenMostRecent.add(key);
      continue;
    }
    if (!result.has(row.athleteId)) result.set(row.athleteId, new Map());
    const byCompetency = result.get(row.athleteId)!;
    if (!byCompetency.has(row.competencyId)) byCompetency.set(row.competencyId, row.value);
  }

  return result;
}
