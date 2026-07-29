"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AreaSlug } from "@/lib/areas";
import type { TeamSummaryDTO } from "@/lib/types";

export function TeamList({ area, teams }: { area: AreaSlug; teams: TeamSummaryDTO[] }) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover a equipa "${name}"? Esta ação apaga também os seus atletas e pontuações.`)) {
      return;
    }
    const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (teams.length === 0) {
    return <p className="empty">Sem equipas ainda. Cria a primeira à esquerda.</p>;
  }

  return (
    <ul className="list-plain">
      {teams.map((team) => (
        <li key={team.id}>
          <Link
            href={`/${area}/teams/${team.id}`}
            style={{ flex: 1, display: "flex", justifyContent: "space-between", textDecoration: "none" }}
          >
            <span>{team.name}</span>
            <span className="mono" style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {team.athleteCount} atleta{team.athleteCount === 1 ? "" : "s"}
            </span>
          </Link>
          <button
            type="button"
            className="del"
            onClick={() => handleDelete(team.id, team.name)}
          >
            remover
          </button>
        </li>
      ))}
    </ul>
  );
}
