"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type GroupContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const GroupContext = createContext<GroupContextValue | null>(null);

/** Garante que só uma ExpandableRow (ou AreaPanel) fica aberta de cada vez
 * dentro deste grupo. Sem ele, cada uma abre/fecha de forma independente.
 * `initialOpenId` deixa uma já aberta à partida, em vez de tudo fechado. */
export function ExpandableRowGroup({
  children,
  initialOpenId = null,
}: {
  children: ReactNode;
  initialOpenId?: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  return <GroupContext.Provider value={{ openId, setOpenId }}>{children}</GroupContext.Provider>;
}

export function useExpandableRowGroup() {
  return useContext(GroupContext);
}
