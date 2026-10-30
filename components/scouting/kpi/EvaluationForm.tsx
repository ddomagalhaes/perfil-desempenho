"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameContext } from "@/lib/scouting-kpi/types";
import { KPIS_PERIODICAS, KPIS_POR_JOGO } from "@/lib/scouting-kpi/kpiData";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import { useGlobalSaveStatus } from "@/components/layout/SaveStatusProvider";
import { PerGameFields } from "./PerGameFields";
import { PeriodicFields } from "./PeriodicFields";

interface Props {
  prospectId: string;
  context: GameContext;
  periodoLabel: string;
  /** Nome de quem tem sessão iniciada — pré-preenche o avaliador, continua
   * editável para o caso de alguém estar a avaliar em nome de outra pessoa. */
  avaliadorInicial: string;
}

/** Uma sessão de avaliação = por jogo + periódica + notas partilhadas,
 * gravadas juntas num só "Guardar avaliação" — deixou de haver separadores
 * porque as duas cadências passaram a fazer parte do mesmo PDF. */
export function EvaluationForm({ prospectId, context, periodoLabel, avaliadorInicial }: Props) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();
  const globalSaveStatus = useGlobalSaveStatus();

  const [avaliadorOverride, setAvaliadorOverride] = useState<string | null>(null);
  const avaliador = avaliadorOverride ?? avaliadorInicial;

  const [jogoContext, setJogoContext] = useState<GameContext>(context);
  const [jogoScores, setJogoScores] = useState<Record<string, number>>(
    Object.fromEntries(KPIS_POR_JOGO.map((k) => [k.id, 5]))
  );
  const [periodo, setPeriodo] = useState(periodoLabel);
  const [periodicaScores, setPeriodicaScores] = useState<Record<string, number>>(
    Object.fromEntries(KPIS_PERIODICAS.map((k) => [k.id, 5]))
  );
  const [notas, setNotas] = useState("");

  /** Grava as duas avaliações (por jogo + periódica) de uma vez, com as
   * mesmas notas nas duas — devolve o id da avaliação "por jogo" criada, que
   * é sempre o que se usa para abrir o PDF (a página de impressão encontra a
   * periódica sozinha, pela proximidade no tempo). */
  async function submitBoth(): Promise<string | null> {
    setSaveState("saving");
    globalSaveStatus.report("saving");
    try {
      const [jogoRes, periodicaRes] = await Promise.all([
        fetch("/api/scouting-evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectId,
            avaliador,
            notas,
            cadence: "por_jogo",
            scores: jogoScores,
            context: jogoContext,
          }),
        }),
        fetch("/api/scouting-evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectId,
            avaliador,
            notas,
            cadence: "periodica",
            scores: periodicaScores,
            periodo,
          }),
        }),
      ]);
      if (!jogoRes.ok || !periodicaRes.ok) throw new Error("save failed");
      const jogoData = await jogoRes.json();
      setSaveState("saved");
      globalSaveStatus.report("saved");
      router.refresh();
      return typeof jogoData?.id === "string" ? jogoData.id : null;
    } catch {
      setSaveState("error");
      globalSaveStatus.report("error");
      return null;
    }
  }

  async function handleGeneratePdf() {
    // Abre a aba já aqui, de forma síncrona com o clique — se esperarmos pelo
    // "await submitBoth()" antes de chamar window.open, o browser deixa de o
    // tratar como aberto a pedido do utilizador e bloqueia o popup.
    const pdfWindow = window.open("", "_blank");
    const id = await submitBoth();
    if (id && pdfWindow) {
      pdfWindow.location.href = `/print/scouting/evaluation/${id}`;
    } else {
      pdfWindow?.close();
    }
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

      <div className="kpi-form">
        <PerGameFields
          context={jogoContext}
          onContextChange={(patch) => setJogoContext((c) => ({ ...c, ...patch }))}
          scores={jogoScores}
          onScoreChange={(kpiId, value) => setJogoScores((s) => ({ ...s, [kpiId]: value }))}
        />

        <PeriodicFields
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          scores={periodicaScores}
          onScoreChange={(kpiId, value) => setPeriodicaScores((s) => ({ ...s, [kpiId]: value }))}
        />

        <div className="kpi-form-section">
          <label className="field" htmlFor="kpi-notas">
            Notas
          </label>
          <textarea
            id="kpi-notas"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observações de balneário, treinos ou conversas com o staff técnico — aparecem no PDF."
          />
        </div>

        <div className="kpi-form-actions">
          <button type="button" onClick={() => submitBoth()} className="primary" disabled={saveState === "saving"}>
            Guardar avaliação
          </button>
          <button type="button" onClick={handleGeneratePdf} disabled={saveState === "saving"}>
            Gerar PDF
          </button>
        </div>

        <div className="kpi-save-status">
          <SaveStatus state={saveState} />
        </div>
      </div>
    </div>
  );
}
