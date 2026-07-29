import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NoteMap, ProspectDTO, ProspectDetailDTO } from "@/lib/types";

function toProspectDTO(row: {
  id: string;
  name: string;
  positionId: string | null;
  club: string | null;
  athleteId: string | null;
  position: { name: string } | null;
  athlete: { team: { name: string } } | null;
}): ProspectDTO {
  return {
    id: row.id,
    name: row.name,
    positionId: row.positionId,
    positionName: row.position?.name ?? null,
    club: row.club,
    athleteId: row.athleteId,
    athleteTeamName: row.athlete?.team.name ?? null,
  };
}

const include = {
  position: { select: { name: true } },
  athlete: { select: { team: { select: { name: true } } } },
} as const;

export async function listProspects(): Promise<ProspectDTO[]> {
  const rows = await prisma.prospect.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
    include,
  });
  return rows.map(toProspectDTO);
}

export async function createProspect(input: {
  name: string;
  positionId: string | null;
  club: string | null;
}): Promise<ProspectDTO> {
  const created = await prisma.prospect.create({
    data: {
      name: input.name.trim(),
      positionId: input.positionId,
      club: input.club?.trim() || null,
    },
    include,
  });
  return toProspectDTO(created);
}

/** Creates (or returns the existing) scouting profile for an athlete already on a
 * team, copying their name/position so they can be compared against external
 * prospects on the same basis. */
export async function linkAthleteAsProspect(athleteId: string): Promise<ProspectDTO> {
  const existing = await prisma.prospect.findUnique({ where: { athleteId }, include });
  if (existing) return toProspectDTO(existing);

  const athlete = await prisma.athlete.findUniqueOrThrow({ where: { id: athleteId } });
  const created = await prisma.prospect.create({
    data: { name: athlete.name, positionId: athlete.positionId, athleteId },
    include,
  });
  return toProspectDTO(created);
}

export async function updateProspect(
  id: string,
  input: { name?: string; positionId?: string | null; club?: string | null }
): Promise<ProspectDTO> {
  const updated = await prisma.prospect.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.positionId !== undefined ? { positionId: input.positionId } : {}),
      ...(input.club !== undefined ? { club: input.club?.trim() || null } : {}),
    },
    include,
  });
  return toProspectDTO(updated);
}

export async function archiveProspect(id: string): Promise<void> {
  await prisma.prospect.update({ where: { id }, data: { archivedAt: new Date() } });
}

export async function getProspectDetail(id: string): Promise<ProspectDetailDTO | null> {
  const row = await prisma.prospect.findUnique({
    where: { id },
    include: { ...include, notes: true },
  });
  if (!row) return null;

  const notes: NoteMap = {};
  for (const n of row.notes) notes[n.competencyId] = n.note;

  return { ...toProspectDTO(row), notes };
}

/** Deletes the note row when cleared instead of storing an empty string, so
 * "never observed" and "observed, nothing to say" don't need to be told apart. */
export async function upsertScoutingNote(
  prospectId: string,
  competencyId: string,
  note: string
): Promise<void> {
  const trimmed = note.trim();
  if (!trimmed) {
    await prisma.scoutingNote
      .delete({ where: { prospectId_competencyId: { prospectId, competencyId } } })
      .catch(() => undefined);
    return;
  }

  await prisma.scoutingNote.upsert({
    where: { prospectId_competencyId: { prospectId, competencyId } },
    create: { prospectId, competencyId, note: trimmed },
    update: { note: trimmed },
  });
}
