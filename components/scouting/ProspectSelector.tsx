"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ProspectDTO } from "@/lib/types";

export function ProspectSelector({
  prospects,
  selectedIds,
}: {
  prospects: ProspectDTO[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set("ids", next.join(","));
    else params.delete("ids");
    router.push(`/scouting/compare?${params.toString()}`);
  }

  if (prospects.length === 0) {
    return <p className="empty">Cria prospetos primeiro para os poderes comparar.</p>;
  }

  return (
    <ul className="list-plain">
      {prospects.map((p) => (
        <li key={p.id}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            {p.name}
            <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
              {p.positionName ?? "Sem posição"}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
