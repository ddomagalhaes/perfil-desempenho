import "server-only";
import { prisma } from "@/lib/db/prisma";

export type SearchResult = {
  id: string;
  label: string;
  meta: string;
  href: string;
  kind: "atleta" | "prospeto";
};

/** Pesquisa simples por nome, usada pela barra de topo (Ctrl+K). Cobre
 * atletas (equipas) e prospetos de scouting — os dois sítios onde faz
 * sentido "ir direto a uma pessoa" na app. */
export async function searchPeople(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [athletes, prospects] = await Promise.all([
    prisma.athlete.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { team: { select: { name: true } } },
      take: 6,
    }),
    prisma.prospect.findMany({
      where: { name: { contains: q, mode: "insensitive" }, archivedAt: null },
      include: { position: { select: { name: true } } },
      take: 6,
    }),
  ]);

  const athleteResults: SearchResult[] = athletes.map((a) => ({
    id: a.id,
    label: a.name,
    meta: a.team.name,
    href: `/psychological/teams/${a.teamId}/athletes/${a.id}`,
    kind: "atleta",
  }));

  const prospectResults: SearchResult[] = prospects.map((p) => ({
    id: p.id,
    label: p.name,
    meta: p.position?.name ?? "Sem posição",
    href: `/scouting/prospects/${p.id}`,
    kind: "prospeto",
  }));

  return [...athleteResults, ...prospectResults];
}
