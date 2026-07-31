"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamSummaryDTO } from "@/lib/types";

interface ImportSummary {
  criados: number;
  ignorados: { linha: number; nome: string; motivo: string }[];
}

export function ImportRosterForm({ teams }: { teams: TeamSummaryDTO[] }) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !teamId) return;

    setImporting(true);
    setSummary(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", teamId);
      const res = await fetch("/api/technical-import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao importar o ficheiro.");
      } else {
        setSummary(data);
        router.refresh();
      }
    } catch {
      setError("Falha ao importar o ficheiro.");
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (teams.length === 0) {
    return <p className="empty">Cria uma equipa primeiro para poderes importar um roster.</p>;
  }

  return (
    <div>
      <label className="field" htmlFor="import-team">
        Equipa de destino
      </label>
      <select id="import-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" disabled={importing || !teamId} onClick={() => fileInput.current?.click()}>
          {importing ? "A importar…" : "Importar Excel (Google Forms)"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx"
          onChange={handleFileChosen}
          style={{ display: "none" }}
        />
      </div>

      <p className="hint">
        Cria um atleta novo por cada resposta do formulário — não corresponde a atletas já existentes.
      </p>

      {error && <p className="hint" style={{ color: "var(--danger)" }}>{error}</p>}

      {summary && (
        <div className="hint">
          <p>{summary.criados} atleta{summary.criados === 1 ? "" : "s"} criado{summary.criados === 1 ? "" : "s"}.</p>
          {summary.ignorados.length > 0 && (
            <>
              <p>{summary.ignorados.length} linha{summary.ignorados.length === 1 ? "" : "s"} ignorada{summary.ignorados.length === 1 ? "" : "s"}:</p>
              <ul>
                {summary.ignorados.map((ig, i) => (
                  <li key={i}>
                    {ig.nome || `linha ${ig.linha}`}: {ig.motivo}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
