import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { CompetencyDTO, CompetencyInput, PositionDTO } from "@/lib/types";

export async function listPositions(): Promise<PositionDTO[]> {
  const rows = await prisma.position.findMany({
    where: { archivedAt: null },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, sortOrder: r.sortOrder }));
}

export async function createPosition(name: string): Promise<PositionDTO> {
  const count = await prisma.position.count({ where: { archivedAt: null } });
  const created = await prisma.position.create({
    data: { name: name.trim(), sortOrder: count },
  });
  return { id: created.id, name: created.name, sortOrder: created.sortOrder };
}

export async function renamePosition(id: string, name: string): Promise<PositionDTO> {
  const updated = await prisma.position.update({
    where: { id },
    data: { name: name.trim() },
  });
  return { id: updated.id, name: updated.name, sortOrder: updated.sortOrder };
}

export async function archivePosition(id: string): Promise<void> {
  await prisma.position.update({ where: { id }, data: { archivedAt: new Date() } });
}

/** Active technical competencies linked to a position, ordered by this position's
 * own ranking (a shared competency can rank differently across positions). */
export async function getPositionCompetencies(positionId: string): Promise<CompetencyDTO[]> {
  const links = await prisma.positionCompetency.findMany({
    where: { positionId, competency: { archivedAt: null } },
    orderBy: { sortOrder: "asc" },
    include: { competency: true },
  });
  return links.map((l) => ({
    id: l.competency.id,
    name: l.competency.name,
    description: l.competency.description,
    sortOrder: l.sortOrder,
  }));
}

/**
 * Replaces a position's ordered competency list. Matches new items against ALL active
 * technical competencies (not just this position's) by name, case-insensitive, so a
 * competency can be shared across positions and renaming preserves scores. Removing a
 * competency from a position only unlinks it; the underlying Competency is archived
 * only once no position references it anymore.
 */
export async function replacePositionCompetencies(
  positionId: string,
  items: CompetencyInput[]
): Promise<CompetencyDTO[]> {
  const trimmed = items
    .map((item) => ({ name: item.name.trim(), description: item.description.trim() }))
    .filter((item) => item.name.length > 0);

  return prisma.$transaction(async (tx) => {
    const allTechnical = await tx.competency.findMany({
      where: { archivedAt: null, area: "TECHNICAL" },
    });
    const currentLinks = await tx.positionCompetency.findMany({ where: { positionId } });

    const keptCompetencyIds = new Set<string>();
    const result: CompetencyDTO[] = [];

    for (let i = 0; i < trimmed.length; i++) {
      const { name, description } = trimmed[i];
      const match = allTechnical.find(
        (c) => !keptCompetencyIds.has(c.id) && c.name.toLowerCase() === name.toLowerCase()
      );

      let competencyId: string;
      if (match) {
        competencyId = match.id;
        await tx.competency.update({ where: { id: match.id }, data: { name, description } });
      } else {
        const created = await tx.competency.create({
          data: { name, description, area: "TECHNICAL", sortOrder: 0 },
        });
        competencyId = created.id;
      }

      await tx.positionCompetency.upsert({
        where: { positionId_competencyId: { positionId, competencyId } },
        create: { positionId, competencyId, sortOrder: i },
        update: { sortOrder: i },
      });

      keptCompetencyIds.add(competencyId);
      result.push({ id: competencyId, name, description, sortOrder: i });
    }

    const toUnlink = currentLinks.filter((l) => !keptCompetencyIds.has(l.competencyId));
    if (toUnlink.length > 0) {
      await tx.positionCompetency.deleteMany({
        where: { positionId, competencyId: { in: toUnlink.map((l) => l.competencyId) } },
      });

      for (const link of toUnlink) {
        const remaining = await tx.positionCompetency.count({
          where: { competencyId: link.competencyId },
        });
        if (remaining === 0) {
          await tx.competency.update({
            where: { id: link.competencyId },
            data: { archivedAt: new Date() },
          });
        }
      }
    }

    return result;
  });
}
