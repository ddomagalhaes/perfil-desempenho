"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PositionPicker } from "@/components/athletes/PositionPicker";
import type { AreaSlug } from "@/lib/areas";
import type { AthleteDTO, PositionDTO } from "@/lib/types";

export function AthleteList({
  area,
  teamId,
  athletes,
  positions,
}: {
  area: AreaSlug;
  teamId: string;
  athletes: AthleteDTO[];
  positions?: PositionDTO[];
}) {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    try {
      const res = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, name: trimmed }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string, athleteName: string) {
    if (!confirm(`Remover o atleta "${athleteName}"?`)) return;
    const res = await fetch(`/api/athletes/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do atleta"
        />
        <button type="submit" className="primary" disabled={pending || !name.trim()}>
          Adicionar
        </button>
      </form>
      <ul className="list-plain">
        {athletes.length === 0 && (
          <li style={{ color: "var(--text-muted)", cursor: "default" }}>Sem atletas ainda</li>
        )}
        {athletes.map((a) => (
          <li key={a.id}>
            <Link
              href={`/${area}/teams/${teamId}/athletes/${a.id}`}
              style={{ flex: 1, textDecoration: "none" }}
            >
              {a.name}
            </Link>
            {positions ? (
              <PositionPicker
                athleteId={a.id}
                positions={positions}
                currentPositionId={a.positionId}
              />
            ) : null}
            <button type="button" className="del" onClick={() => handleDelete(a.id, a.name)}>
              remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
