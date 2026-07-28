"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TeamSummaryDTO } from "@/lib/types";

export function TeamSelector({
  teams,
  selectedIds,
}: {
  teams: TeamSummaryDTO[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set("teams", next.join(","));
    else params.delete("teams");
    router.push(`/compare?${params.toString()}`);
  }

  if (teams.length === 0) {
    return <p className="empty">Cria equipas primeiro para as poderes comparar.</p>;
  }

  return (
    <ul className="list-plain">
      {teams.map((team) => (
        <li key={team.id}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(team.id)}
              onChange={() => toggle(team.id)}
            />
            {team.name}
          </label>
        </li>
      ))}
    </ul>
  );
}
