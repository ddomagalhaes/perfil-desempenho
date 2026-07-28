import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AreaType } from "@/app/generated/prisma/enums";
import type { CompetencyDTO, CompetencyInput } from "@/lib/types";

export async function getActiveCompetencies(area: AreaType): Promise<CompetencyDTO[]> {
  const rows = await prisma.competency.findMany({
    where: { archivedAt: null, area },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    sortOrder: r.sortOrder,
  }));
}

/**
 * Replaces the full ordered competency list for the given area, matching new items
 * against existing active ones (same area, case-insensitive name) so scores already
 * recorded under an unchanged name are preserved. Names dropped from the list are
 * archived, not deleted.
 *
 * Used directly by the Psychological flat-list editor. The Technical area instead
 * manages competencies per-position via lib/data/positions.ts, which follows the same
 * diff-by-name principle but links/unlinks a PositionCompetency row instead of
 * archiving outright (a technical competency may be shared by several positions).
 */
export async function replaceCompetencies(
  area: AreaType,
  items: CompetencyInput[]
): Promise<CompetencyDTO[]> {
  const trimmed = items
    .map((item) => ({ name: item.name.trim(), description: item.description.trim() }))
    .filter((item) => item.name.length > 0);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.competency.findMany({
      where: { archivedAt: null, area },
      orderBy: { sortOrder: "asc" },
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
          data: { name, description, sortOrder: i },
        });
        result.push({ id: match.id, name, description, sortOrder: i });
      } else {
        const created = await tx.competency.create({
          data: { name, description, area, sortOrder: i },
        });
        result.push({
          id: created.id,
          name: created.name,
          description: created.description,
          sortOrder: created.sortOrder,
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
