"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { useExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";

const HOVER_OPEN_DELAY_MS = 120;

interface AreaPanelProps {
  id: string;
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  stat: string | null;
  links: { href: string; label: string }[];
}

/** Uma "fatia" da página inicial que expande para dentro ao passar o cursor —
 * mesma lógica de abertura do ExpandableRow (hover ~120ms, toque/clique
 * alterna, foco por teclado abre, Esc fecha, só uma aberta por grupo), só que
 * em largura (desktop) ou altura (telemóvel) em vez de altura de uma linha. */
export function AreaPanel({ id, href, icon, title, description, stat, links }: AreaPanelProps) {
  const group = useExpandableRowGroup();
  const isOpen = group?.openId === id;
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearHoverTimer() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function setOpen(next: boolean) {
    if (!group) return;
    group.setOpenId(next ? id : group.openId === id ? null : group.openId);
  }

  return (
    <div
      className={["area-panel", isOpen ? "open" : ""].filter(Boolean).join(" ")}
      onMouseEnter={() => {
        clearHoverTimer();
        hoverTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY_MS);
      }}
      onMouseLeave={() => {
        clearHoverTimer();
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          clearHoverTimer();
          setOpen(false);
        }
      }}
    >
      <div className="area-panel-bg" aria-hidden="true">
        {icon}
      </div>

      <button
        type="button"
        className="area-panel-summary"
        aria-expanded={isOpen}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(!isOpen)}
      >
        <span className="area-panel-icon">{icon}</span>
        <span className="area-panel-title">{title}</span>
      </button>

      <div className="area-panel-body">
        <div className="area-panel-body-clip">
          <div className="area-panel-body-inner">
            <p className="area-panel-desc">{description}</p>
            {stat && <p className="area-panel-stat">{stat}</p>}
            <div className="area-panel-links">
              <Link href={href} className="area-panel-cta">
                Abrir
              </Link>
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
