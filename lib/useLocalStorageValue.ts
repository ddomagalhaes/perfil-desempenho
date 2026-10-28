"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(key: string): () => string | null {
  return () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };
}

function getServerSnapshot(): string | null {
  return null;
}

/** Lê um valor de localStorage via useSyncExternalStore em vez de
 * useEffect+setState (o padrão correto para uma fonte externa — evita o
 * aviso "set state synchronously within an effect" e lida bem com SSR: no
 * servidor devolve sempre null, só troca para o valor real depois de montar
 * no cliente). Não reage a escritas feitas pela própria aba (window
 * "storage" só dispara nas outras abas) — para isso, quem escreve chama
 * window.dispatchEvent(new StorageEvent("storage")) a seguir ao setItem. */
export function useLocalStorageValue(key: string): string | null {
  return useSyncExternalStore(subscribe, getSnapshot(key), getServerSnapshot);
}
