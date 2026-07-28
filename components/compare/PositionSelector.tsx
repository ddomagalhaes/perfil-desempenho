"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PositionDTO } from "@/lib/types";

export function PositionSelector({
  positions,
  selectedId,
}: {
  positions: PositionDTO[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectPosition(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("position", id);
    router.push(`/technical/compare?${params.toString()}`);
  }

  if (positions.length === 0) {
    return <p className="empty">Sem posições configuradas ainda.</p>;
  }

  return (
    <ul className="list-plain">
      {positions.map((p) => (
        <li
          key={p.id}
          className={p.id === selectedId ? "active" : ""}
          onClick={() => selectPosition(p.id)}
          style={{ cursor: "pointer" }}
        >
          <span>{p.name}</span>
        </li>
      ))}
    </ul>
  );
}
