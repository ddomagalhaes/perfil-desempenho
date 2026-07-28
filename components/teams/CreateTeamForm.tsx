"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateTeamForm() {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field" htmlFor="team-name">
        Nome da equipa
      </label>
      <div className="row">
        <input
          id="team-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Sub-19 Masculino"
        />
        <button type="submit" className="primary" disabled={pending || !name.trim()}>
          Criar
        </button>
      </div>
    </form>
  );
}
