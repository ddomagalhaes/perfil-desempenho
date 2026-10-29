"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type GroupContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const GroupContext = createContext<GroupContextValue | null>(null);

/** Garante que só uma ExpandableRow fica aberta de cada vez dentro desta lista.
 * Sem este grupo, cada linha abre/fecha de forma independente. */
export function ExpandableRowGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <GroupContext.Provider value={{ openId, setOpenId }}>{children}</GroupContext.Provider>;
}

export function useExpandableRowGroup() {
  return useContext(GroupContext);
}
