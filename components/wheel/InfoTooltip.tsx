"use client";

import { useEffect, useRef, useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  if (!text) return null;

  return (
    <span ref={ref} className="info-tooltip">
      <button
        type="button"
        className="info-tooltip-icon"
        aria-label="Descrição da competência"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        ⓘ
      </button>
      {open && (
        <span className="info-tooltip-popover" role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
