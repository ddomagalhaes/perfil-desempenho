"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Atraso em ms antes de revelar, depois de entrar em vista — para um efeito
   * em cascata entre vários ScrollReveal vizinhos. */
  delay?: number;
  className?: string;
}

/** Revela o conteúdo com um fade + deslize suave quando entra na área visível
 * do ecrã, em vez de aparecer tudo de uma vez ao carregar a página. A classe
 * "is-visible" é alternada diretamente no DOM (não via useState) para nunca
 * voltar a renderizar o conteúdo envolvido só por causa disto — o conteúdo
 * passado em `children` pode já vir de um Server Component, e um re-render
 * daqui não deve mexer-lhe. Dispara só uma vez; CSS trata do
 * prefers-reduced-motion, mostrando o conteúdo já parado. */
export function ScrollReveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={["scroll-reveal", className].filter(Boolean).join(" ")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
