import type { AreaType } from "@/app/generated/prisma/enums";

export type AreaSlug = "psychological" | "technical" | "scouting";

export const AREA_SLUGS: AreaSlug[] = ["psychological", "technical", "scouting"];

export const AREA_TYPE_BY_SLUG: Record<AreaSlug, AreaType> = {
  psychological: "PSYCHOLOGICAL",
  technical: "TECHNICAL",
  scouting: "SCOUTING",
};

export const AREA_LABELS: Record<AreaSlug, string> = {
  psychological: "Psicológico",
  technical: "Técnico/Tático",
  scouting: "Scouting",
};

export function isAreaSlug(value: string): value is AreaSlug {
  return AREA_SLUGS.includes(value as AreaSlug);
}

export function areaTypeFromSlug(slug: AreaSlug): AreaType {
  return AREA_TYPE_BY_SLUG[slug];
}

/** Subset of areas that group data by team (psychological/technical). Scouting has
 * prospects instead of teams, so it deliberately does not satisfy this guard — pages
 * under `[area]/teams`, `[area]/legend`, `[area]/compare`, and `print/[area]/*` all
 * use it to 404 correctly for `/scouting/...` rather than treating it as a team area. */
export type TeamAreaSlug = "psychological" | "technical";

export const TEAM_AREA_SLUGS: TeamAreaSlug[] = ["psychological", "technical"];

export function isTeamAreaSlug(value: string): value is TeamAreaSlug {
  return TEAM_AREA_SLUGS.includes(value as TeamAreaSlug);
}
