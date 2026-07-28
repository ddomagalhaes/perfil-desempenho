import type { AreaType } from "@/app/generated/prisma/enums";

export type AreaSlug = "psychological" | "technical";

export const AREA_SLUGS: AreaSlug[] = ["psychological", "technical"];

export const AREA_TYPE_BY_SLUG: Record<AreaSlug, AreaType> = {
  psychological: "PSYCHOLOGICAL",
  technical: "TECHNICAL",
};

export const AREA_LABELS: Record<AreaSlug, string> = {
  psychological: "Psicológico",
  technical: "Técnico/Tático",
};

export function isAreaSlug(value: string): value is AreaSlug {
  return AREA_SLUGS.includes(value as AreaSlug);
}

export function areaTypeFromSlug(slug: AreaSlug): AreaType {
  return AREA_TYPE_BY_SLUG[slug];
}
