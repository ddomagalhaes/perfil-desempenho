"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { SaveState } from "./SaveStatus";

type SaveStatusContextValue = {
  state: SaveState;
  report: (state: SaveState) => void;
};

const SaveStatusContext = createContext<SaveStatusContextValue | null>(null);

/** Estado de gravação partilhado por toda a app, mostrado na barra de topo.
 * Qualquer página que grave algo chama useGlobalSaveStatus().report(...) com
 * a resposta real do pedido — nunca um valor inventado. Volta a "idle" ao
 * fim de alguns segundos depois de "saved", para a pílula não ficar presa. */
export function SaveStatusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SaveState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const report = useCallback((next: SaveState) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState(next);
    if (next === "saved") {
      timeoutRef.current = setTimeout(() => setState("idle"), 4000);
    }
  }, []);

  return (
    <SaveStatusContext.Provider value={{ state, report }}>{children}</SaveStatusContext.Provider>
  );
}

export function useGlobalSaveStatus(): SaveStatusContextValue {
  const ctx = useContext(SaveStatusContext);
  if (!ctx) {
    // Fora do provider (não devia acontecer, mas evita rebentar a app) —
    // devolve um no-op em vez de atirar um erro no meio de uma gravação.
    return { state: "idle", report: () => {} };
  }
  return ctx;
}
