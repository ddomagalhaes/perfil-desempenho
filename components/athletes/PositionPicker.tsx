"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PositionDTO } from "@/lib/types";

export function PositionPicker({
  athleteId,
  positions,
  currentPositionId,
}: {
  athleteId: string;
  positions: PositionDTO[];
  currentPositionId: string | null;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value || null;
    setPending(true);
    try {
      const res = await fetch(`/api/athletes/${athleteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId: value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      value={currentPositionId ?? ""}
      onChange={handleChange}
      disabled={pending}
      className="mono"
      style={{ width: "auto", fontSize: 11, padding: "2px 6px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">Sem posição</option>
      {positions.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
