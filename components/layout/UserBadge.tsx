"use client";

import { useState } from "react";
import { useLocalStorageValue } from "@/lib/useLocalStorageValue";

const STORAGE_KEY = "perfil-desempenho:nome-utilizador";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Não há contas nem login nesta app — isto é só um nome que cada pessoa
 * escreve uma vez no seu próprio browser (localStorage), para teres iniciais
 * na barra de topo em vez de inventar um utilizador com sessão a sério. */
export function UserBadge() {
  const name = useLocalStorageValue(STORAGE_KEY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEditing() {
    setDraft(name ?? "");
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
      // setItem só dispara "storage" nas OUTRAS abas — disparamos à mão para
      // o useSyncExternalStore desta própria aba (aqui e no Avaliador do
      // formulário de avaliação) também atualizar na hora.
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: trimmed }));
    } catch {
      // se não conseguir gravar, fica só para esta visita
    }
  }

  if (editing) {
    return (
      <form
        className="topbar-user-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          placeholder="O teu nome"
        />
      </form>
    );
  }

  return (
    <button type="button" className="topbar-user" onClick={startEditing}>
      <span className="topbar-user-initials">{name ? initials(name) : "?"}</span>
      <span className="topbar-user-name">{name ?? "Definir nome"}</span>
    </button>
  );
}
