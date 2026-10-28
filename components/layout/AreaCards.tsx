"use client";

import Link from "next/link";
import { AREA_LABELS, AREA_SLUGS, type AreaSlug } from "@/lib/areas";

type NavSection = AreaSlug | "school";

const SECTION_SUBTITLE: Record<NavSection, string> = {
  psychological: "Perfil por competências",
  technical: "Competências por posição",
  scouting: "Prospetos e avaliação",
  school: "Horários escolares",
};

const SECTION_HREF: Record<NavSection, string> = {
  psychological: "/psychological/competencies",
  technical: "/technical/competencies",
  scouting: "/scouting/prospects",
  school: "/school/groups/pousada",
};

const SECTIONS: NavSection[] = [...AREA_SLUGS, "school"];

/** Só aparece na página de entrada de cada área (não em páginas fundas) —
 * trocar de área a meio de uma tarefa continua a ser só o "Início" da
 * barra de topo. */
export function AreaCards({ active }: { active: NavSection }) {
  return (
    <div className="area-cards">
      {SECTIONS.map((slug) => (
        <Link
          key={slug}
          href={SECTION_HREF[slug]}
          className={slug === active ? "area-card active" : "area-card"}
        >
          <span className="area-card-title">{slug === "school" ? "Escolar" : AREA_LABELS[slug]}</span>
          <span className="area-card-subtitle">{SECTION_SUBTITLE[slug]}</span>
        </Link>
      ))}
    </div>
  );
}
