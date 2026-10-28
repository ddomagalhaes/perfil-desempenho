"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/layout/Panel";
import type { PositionDTO, ProspectDTO } from "@/lib/types";

type LinkableAthlete = { id: string; name: string; teamName: string; alreadyLinked: boolean };

export function ProspectManager({
  prospects,
  positions,
  athletes,
}: {
  prospects: ProspectDTO[];
  positions: PositionDTO[];
  athletes: LinkableAthlete[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [positionId, setPositionId] = useState("");
  const [club, setClub] = useState("");
  const [creating, setCreating] = useState(false);

  const linkable = athletes.filter((a) => !a.alreadyLinked);
  const [athleteId, setAthleteId] = useState("");
  const [linking, setLinking] = useState(false);

  const [positionFilter, setPositionFilter] = useState("");
  const filteredProspects = positionFilter
    ? prospects.filter((p) => p.positionId === positionFilter)
    : prospects;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, positionId: positionId || null, club: club || null }),
      });
      if (res.ok) {
        setName("");
        setPositionId("");
        setClub("");
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleLinkAthlete(e: React.FormEvent) {
    e.preventDefault();
    if (!athleteId || linking) return;

    setLinking(true);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId }),
      });
      if (res.ok) {
        setAthleteId("");
        router.refresh();
      }
    } finally {
      setLinking(false);
    }
  }

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Remover o prospeto "${name}"? As notas de scouting ficam arquivadas.`)) return;
    const res = await fetch(`/api/prospects/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="layout">
      <div>
        <div className="panel">
          <h2>Novo prospeto externo</h2>
          <form onSubmit={handleCreate}>
            <label className="field" htmlFor="prospect-name">
              Nome
            </label>
            <input
              id="prospect-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: João Silva"
            />
            <label className="field" htmlFor="prospect-position">
              Posição
            </label>
            <select
              id="prospect-position"
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
            >
              <option value="">Sem posição</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <label className="field" htmlFor="prospect-club">
              Clube atual (opcional)
            </label>
            <input
              id="prospect-club"
              type="text"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Ex.: FC Exemplo"
            />
            <div className="row" style={{ marginTop: 8 }}>
              <button type="submit" className="primary" disabled={creating || !name.trim()}>
                Criar prospeto
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Adicionar atleta existente</h2>
          <p className="hint">
            Liga um atleta já numa equipa para o avaliares também com os KPIs de scouting.
          </p>
          <form onSubmit={handleLinkAthlete} className="row">
            <select value={athleteId} onChange={(e) => setAthleteId(e.target.value)} style={{ flex: 1 }}>
              <option value="">Escolhe um atleta…</option>
              {linkable.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.teamName})
                </option>
              ))}
            </select>
            <button type="submit" className="primary" disabled={linking || !athleteId}>
              Ligar
            </button>
          </form>
          {linkable.length === 0 && athletes.length > 0 && (
            <p className="hint">Todos os atletas já têm um registo de scouting.</p>
          )}
        </div>
      </div>

      <div>
        <Panel title="Prospetos">
          <div className="section-filters">
            <label className="field" htmlFor="prospect-filter-position">
              Posição
            </label>
            <select
              id="prospect-filter-position"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {prospects.length === 0 && <p className="empty">Sem prospetos ainda.</p>}
          {prospects.length > 0 && filteredProspects.length === 0 && (
            <div className="empty">
              <p>Nenhum prospeto nesta posição.</p>
              <button type="button" onClick={() => setPositionFilter("")}>
                Limpar filtro
              </button>
            </div>
          )}
          <ul className="list-plain">
            {filteredProspects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/scouting/prospects/${p.id}`}
                  style={{ flex: 1, display: "flex", flexDirection: "column", textDecoration: "none" }}
                >
                  <span>
                    {p.name}
                    {p.athleteId && (
                      <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                        {" "}
                        · atleta em {p.athleteTeamName}
                      </span>
                    )}
                  </span>
                  <span className="mono" style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {p.positionName ?? "Sem posição"}
                    {p.club ? ` · ${p.club}` : ""}
                  </span>
                </Link>
                <button type="button" className="del" onClick={() => handleArchive(p.id, p.name)}>
                  remover
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
