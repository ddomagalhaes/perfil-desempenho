"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/lib/data/search";

export function AthleteSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    // Não há nada para limpar aqui: resultados de uma pesquisa anterior mais
    // longa nunca chegam a aparecer, porque o render já só os mostra quando
    // a pesquisa atual tem 2+ carateres (ver mais abaixo).
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch {
        // pesquisa cancelada ou falhou em silêncio — não é crítico
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(href);
  }

  return (
    <div className="topbar-search">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Pesquisar atleta ou prospeto…"
      />
      <kbd className="topbar-search-kbd">Ctrl K</kbd>

      {open && query.trim().length >= 2 && (
        <div className="topbar-search-results">
          {results.length === 0 ? (
            <p className="topbar-search-empty">Sem resultados para &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((r) => (
              <button
                key={`${r.kind}-${r.id}`}
                type="button"
                className="topbar-search-item"
                onMouseDown={() => goTo(r.href)}
              >
                <span className="topbar-search-item-label">{r.label}</span>
                <span className="topbar-search-item-meta">
                  {r.kind} · {r.meta}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
