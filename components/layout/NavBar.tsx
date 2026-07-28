"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/teams", label: "Equipas" },
  { href: "/competencies", label: "Competências" },
  { href: "/compare", label: "Comparar" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="tabs">
      {LINKS.map((link) => {
        const active =
          link.href === "/teams"
            ? pathname === "/teams" || pathname.startsWith("/teams/")
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "tab active" : "tab"}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
