import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { CompetencyDTO, CompetencyInput } from "@/lib/types";

export async function getActiveCompetencies(): Promise<CompetencyDTO[]> {
  const rows = await prisma.competency.findMany({
    where: { archivedAt: null },
    orderBy: { position: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    position: r.position,
  }));
}

/**
 * Replaces the full ordered competency list, matching new items against existing
 * active ones by name (case-insensitive) so scores already recorded under an
 * unchanged name are preserved. Names dropped from the list are archived, not
 * deleted.
 */
export async function replaceCompetencies(
  items: CompetencyInput[]
): Promise<CompetencyDTO[]> {
  const trimmed = items
    .map((item) => ({ name: item.name.trim(), description: item.description.trim() }))
    .filter((item) => item.name.length > 0);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.competency.findMany({
      where: { archivedAt: null },
      orderBy: { position: "asc" },
    });
    const usedIds = new Set<string>();
    const result: CompetencyDTO[] = [];

    for (let i = 0; i < trimmed.length; i++) {
      const { name, description } = trimmed[i];
      const match = existing.find(
        (c) => !usedIds.has(c.id) && c.name.toLowerCase() === name.toLowerCase()
      );
      if (match) {
        usedIds.add(match.id);
        await tx.competency.update({
          where: { id: match.id },
          data: { name, description, position: i },
        });
        result.push({ id: match.id, name, description, position: i });
      } else {
        const created = await tx.competency.create({ data: { name, description, position: i } });
        result.push({
          id: created.id,
          name: created.name,
          description: created.description,
          position: created.position,
        });
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
