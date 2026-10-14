"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AREA_LABELS, AREA_SLUGS, isAreaSlug, type AreaSlug } from "@/lib/areas";

/** "school" is a top-level section but not an AreaSlug: it has no competencies,
 * so it stays out of AreaType/AREA_SLUGS and only lives here in the nav. */
type NavSection = AreaSlug | "school";

const DEFAULT_SECTION: NavSection = "psychological";

const NAV_SECTIONS: NavSection[] = [...AREA_SLUGS, "school"];

const SECTION_LABELS: Record<NavSection, string> = { ...AREA_LABELS, school: "Escolar" };

const SECTION_LANDING_HREF: Record<NavSection, string> = {
  psychological: "/psychological/competencies",
  technical: "/technical/competencies",
  scouting: "/scouting/prospects",
  school: "/school/groups/pousada",
};

function currentSectionFromPathname(pathname: string): NavSection {
  const [, first] = pathname.split("/");
  if (first === "school") return "school";
  return isAreaSlug(first) ? first : DEFAULT_SECTION;
}

export function NavBar() {
  const pathname = usePathname();
  const section = currentSectionFromPathname(pathname);

  const sectionLinks =
    section === "school"
      ? [
          { href: "/school/groups/pousada", label: "Pousada" },
          { href: "/school/groups/uaare", label: "UAARE" },
        ]
      : section === "scouting"
        ? [
            { href: "/scouting/kpis", label: "KPIs" },
            { href: "/scouting/prospects", label: "Prospetos" },
            { href: "/scouting/legend", label: "Legenda" },
            { href: "/scouting/compare", label: "Comparar" },
          ]
        : [
            { href: `/${section}/teams`, label: "Equipas" },
            {
              href: `/${section}/competencies`,
              label: section === "technical" ? "Posições" : "Competências",
            },
            { href: `/${section}/legend`, label: "Legenda" },
            { href: `/${section}/compare`, label: "Comparar" },
          ];

  return (
    <div>
      <div className="tabs">
        {NAV_SECTIONS.map((slug) => (
          <Link
            key={slug}
            href={SECTION_LANDING_HREF[slug]}
            className={section === slug ? "tab active" : "tab"}
          >
            {SECTION_LABELS[slug]}
          </Link>
        ))}
      </div>
      <div className="tabs">
        {sectionLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname.startsWith(link.href) ? "tab active" : "tab"}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
