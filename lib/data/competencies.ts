import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { CompetencyDTO } from "@/lib/types";

export async function getActiveCompetencies(): Promise<CompetencyDTO[]> {
  const rows = await prisma.competency.findMany({
    where: { archivedAt: null },
    orderBy: { position: "asc" },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, position: r.position }));
}

/**
 * Replaces the full ordered competency list, matching new names against existing
 * active ones (case-insensitive) so scores already recorded under an unchanged
 * name are preserved. Names dropped from the list are archived, not deleted.
 */
export async function replaceCompetencies(names: string[]): Promise<CompetencyDTO[]> {
  const trimmed = names.map((n) => n.trim()).filter(Boolean);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.competency.findMany({
      where: { archivedAt: null },
      orderBy: { position: "asc" },
    });
    const usedIds = new Set<string>();
    const result: CompetencyDTO[] = [];

    for (let i = 0; i < trimmed.length; i++) {
      const name = trimmed[i];
      const match = existing.find(
        (c) => !usedIds.has(c.id) && c.name.toLowerCase() === name.toLowerCase()
      );
      if (match) {
        usedIds.add(match.id);
        await tx.competency.update({ where: { id: match.id }, data: { name, position: i } });
        result.push({ id: match.id, name, position: i });
      } else {
        const created = await tx.competency.create({ data: { name, position: i } });
        result.push({ id: created.id, name: created.name, position: created.position });
      }
    }

    const toArchive = existing.filter((c) => !usedIds.has(c.id));
    if (toArchive.length > 0) {
      await tx.competency.updateMany({
        where: { id: { in: toArchive.map((c) => c.id) } },
        data: { archivedAt: new Date() },
      });
    }

    return result;
  });
}
