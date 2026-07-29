"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AREA_LABELS, AREA_SLUGS, isAreaSlug, type AreaSlug } from "@/lib/areas";

const DEFAULT_AREA: AreaSlug = "psychological";

function currentAreaFromPathname(pathname: string): AreaSlug {
  const [, first] = pathname.split("/");
  return isAreaSlug(first) ? first : DEFAULT_AREA;
}

export function NavBar() {
  const pathname = usePathname();
  const area = currentAreaFromPathname(pathname);

  const sectionLinks = [
    { href: `/${area}/teams`, label: "Equipas" },
    { href: `/${area}/competencies`, label: area === "technical" ? "Posições" : "Competências" },
    { href: `/${area}/legend`, label: "Legenda" },
    { href: `/${area}/compare`, label: "Comparar" },
  ];

  return (
    <div>
      <div className="tabs">
        {AREA_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/${slug}/competencies`}
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
