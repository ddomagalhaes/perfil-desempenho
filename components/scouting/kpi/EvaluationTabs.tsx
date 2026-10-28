"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { useGlobalSaveStatus } from "@/components/layout/SaveStatusProvider";
import { useLocalStorageValue } from "@/lib/useLocalStorageValue";
import { PerGameEvaluationForm } from "./PerGameEvaluationForm";
import { PeriodicEvaluationForm } from "./PeriodicEvaluationForm";

interface Props {
  prospectId: string;
  jogadorNome: string;
  context: GameContext;
  periodoLabel: string;
}

type Tab = "por_jogo" | "periodica";

const USER_NAME_KEY = "perfil-desempenho:nome-utilizador";

export function EvaluationTabs({ prospectId, jogadorNome, context, periodoLabel }: Props) {
  const [tab, setTab] = useState<Tab>("por_jogo");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();
  const globalSaveStatus = useGlobalSaveStatus();

  // Pré-preenche com o nome já guardado na barra de topo, se existir — o
  // scout continua a poder mudá-lo por avaliação. useSyncExternalStore em vez
  // de useEffect+setState para ler o localStorage sem mismatch de hidratação
  // (o servidor nunca vê o localStorage, por isso começa sempre em branco).
  const storedName = useLocalStorageValue(USER_NAME_KEY);
  const [avaliadorOverride, setAvaliadorOverride] = useState<string | null>(null);
  const avaliador = avaliadorOverride ?? storedName ?? "";

  /** Grava a avaliação e devolve o id criado (ou null se falhar) — tanto
   * "Guardar" como "Gerar PDF" passam por aqui, porque o PDF é sempre gerado
   * a partir do registo gravado na base de dados, nunca só do estado do ecrã.
   * Reporta à barra de topo (useGlobalSaveStatus) com o mesmo valor que
   * mostra localmente, nunca um estado inventado à parte. */
  async function submit(body: Record<string, unknown>): Promise<string | null> {
    setSaveState("saving");
    globalSaveStatus.report("saving");
    try {
      const res = await fetch("/api/scouting-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, avaliador, ...body }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setSaveState("saved");
      globalSaveStatus.report("saved");
      router.refresh();
      return typeof data?.id === "string" ? data.id : null;
    } catch {
      setSaveState("error");
      globalSaveStatus.report("error");
      return null;
    }
  }

  async function handleGeneratePdf(body: Record<string, unknown>) {
    // Abre a aba já aqui, de forma síncrona com o clique — se esperarmos pelo
    // "await submit(...)" antes de chamar window.open, o browser deixa de o
    // tratar como aberto a pedido do utilizador e bloqueia o popup.
    const pdfWindow = window.open("", "_blank");
    const id = await submit(body);
    if (id && pdfWindow) {
      pdfWindow.location.href = `/print/scouting/evaluation/${id}`;
    } else {
      pdfWindow?.close();
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setSaveState("idle");
  }

  return (
    <div>
      <div className="kpi-avaliador-row">
        <label className="field" htmlFor="kpi-avaliador">
          Avaliador
        </label>
        <input
          id="kpi-avaliador"
          type="text"
          value={avaliador}
          onChange={(e) => setAvaliadorOverride(e.target.value)}
          placeholder="O teu nome, para o cabeçalho do PDF"
        />
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === "por_jogo" ? "tab active" : "tab"}
          onClick={() => switchTab("por_jogo")}
        >
          Por jogo
        </button>
        <button
          type="button"
          className={tab === "periodica" ? "tab active" : "tab"}
          onClick={() => switchTab("periodica")}
        >
          Periódica
        </button>
      </div>

      {tab === "por_jogo" ? (
        <PerGameEvaluationForm
          jogadorNome={jogadorNome}
          context={context}
          saving={saveState === "saving"}
          onSave={(scores, editedContext) => submit({ cadence: "por_jogo", scores, context: editedContext })}
          onGeneratePdf={(scores, editedContext) =>
            handleGeneratePdf({ cadence: "por_jogo", scores, context: editedContext })
          }
        />
      ) : (
        <PeriodicEvaluationForm
          jogadorNome={jogadorNome}
          periodoLabel={periodoLabel}
          saving={saveState === "saving"}
          onSave={(scores, notas, periodo) => submit({ cadence: "periodica", scores, notas, periodo })}
          onGeneratePdf={(scores, notas, periodo) =>
            handleGeneratePdf({ cadence: "periodica", scores, notas, periodo })
          }
        />
      )}

      <div className="kpi-save-status">
        <SaveStatus state={saveState} />
      </div>
    </div>
  );
}
