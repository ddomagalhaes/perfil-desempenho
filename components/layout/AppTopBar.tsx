"use client";

import Link from "next/link";
import { useGlobalSaveStatus } from "./SaveStatusProvider";
import { AthleteSearch } from "./AthleteSearch";
import { UserBadge } from "./UserBadge";
import type { SaveState } from "./SaveStatus";

const TOPBAR_SAVE_LABEL: Record<SaveState, string> = {
  idle: "Pronto para guardar",
  saving: "A guardar…",
  saved: "Guardado",
  error: "Erro ao guardar",
};

export function AppTopBar() {
  const { state } = useGlobalSaveStatus();

  return (
    <div className="topbar">
      <Link href="/" className="topbar-brand">
        <span className="topbar-brand-mark" aria-hidden="true" />
        <span className="topbar-brand-name">Perfil de Desempenho</span>
      </Link>

      <span className="topbar-save-pill" data-state={state}>
        {TOPBAR_SAVE_LABEL[state]}
      </span>

      <AthleteSearch />

      <UserBadge />
    </div>
  );
}
