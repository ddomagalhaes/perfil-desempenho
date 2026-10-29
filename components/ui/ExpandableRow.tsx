"use client";

import { useRef, useState, type ReactNode } from "react";
import { useExpandableRowGroup } from "./ExpandableRowGroup";

const HOVER_OPEN_DELAY_MS = 150;

interface Props {
  /** Identificador único dentro da lista — usado pelo ExpandableRowGroup para
   * saber qual linha está aberta. */
  id: string;
  closed: ReactNode;
  open: ReactNode;
  className?: string;
}

/**
 * Linha compacta/expansível reutilizável:
 * - Rato: hover ~150ms abre, sair da linha fecha.
 * - Toque: tocar no resumo alterna aberto/fechado.
 * - Teclado: Tab até ao resumo abre-a, Esc fecha-a.
 * - Só uma linha aberta de cada vez por lista (via ExpandableRowGroup).
 * - O conteúdo aberto fica fora do botão de resumo, por isso botões lá dentro
 *   nunca fecham a linha ao serem clicados.
 * - Animação de altura via CSS grid (0fr → 1fr); prefers-reduced-motion
 *   desliga a transição no CSS, não aqui.
 */
export function ExpandableRow({ id, closed, open, className }: Props) {
  const group = useExpandableRowGroup();
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = group ? group.openId === id : localOpen;

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearHoverTimer() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function setOpen(next: boolean) {
    if (group) {
      group.setOpenId(next ? id : group.openId === id ? null : group.openId);
    } else {
      setLocalOpen(next);
    }
  }

  return (
    <div
      className={["expandable-row", isOpen ? "open" : "", className].filter(Boolean).join(" ")}
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
      <button
        type="button"
        className="expandable-row-summary"
        aria-expanded={isOpen}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(!isOpen)}
      >
        {closed}
        <span className="expandable-row-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      <div className="expandable-row-body">
        <div>{open}</div>
      </div>
    </div>
  );
}
