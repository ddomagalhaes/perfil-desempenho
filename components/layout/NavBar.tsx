"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AREA_LABELS, AREA_SLUGS, isAreaSlug, type AreaSlug } from "@/lib/areas";

const DEFAULT_AREA: AreaSlug = "psychological";

const AREA_LANDING_HREF: Record<AreaSlug, string> = {
  psychological: "/psychological/competencies",
  technical: "/technical/competencies",
  scouting: "/scouting/prospects",
};

function currentAreaFromPathname(pathname: string): AreaSlug {
  const [, first] = pathname.split("/");
  return isAreaSlug(first) ? first : DEFAULT_AREA;
}

export function NavBar() {
  const pathname = usePathname();
  const area = currentAreaFromPathname(pathname);

  const sectionLinks =
    area === "scouting"
      ? [
          { href: "/scouting/kpis", label: "KPIs" },
          { href: "/scouting/prospects", label: "Prospetos" },
          { href: "/scouting/legend", label: "Legenda" },
          { href: "/scouting/compare", label: "Comparar" },
        ]
      : [
          { href: `/${area}/teams`, label: "Equipas" },
          {
            href: `/${area}/competencies`,
            label: area === "technical" ? "Posições" : "Competências",
          },
          { href: `/${area}/legend`, label: "Legenda" },
          { href: `/${area}/compare`, label: "Comparar" },
        ];

  return (
    <div>
      <div className="tabs">
        {AREA_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={AREA_LANDING_HREF[slug]}
            className={area === slug ? "tab active" : "tab"}
          >
            {AREA_LABELS[slug]}
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
