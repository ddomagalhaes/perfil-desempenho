"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ExcelActions() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setSummary(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/scouting/import", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setSummary(
          `${data.created} criado${data.created === 1 ? "" : "s"}, ${data.updated} atualizado${data.updated === 1 ? "" : "s"}, ${data.notesImported} nota${data.notesImported === 1 ? "" : "s"} importada${data.notesImported === 1 ? "" : "s"}.`
        );
        router.refresh();
      } else {
        setSummary("Falha ao importar o ficheiro.");
      }
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <div className="row">
        {/* Plain <a>, not next/link: this triggers a file download from an API route, not a client navigation. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/scouting/export">
          <button type="button">Exportar Excel</button>
        </a>
        <button type="button" disabled={importing} onClick={() => fileInput.current?.click()}>
          {importing ? "A importar…" : "Importar Excel"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx"
          onChange={handleFileChosen}
          style={{ display: "none" }}
        />
      </div>
      {summary && (
        <span className="hint" style={{ margin: 0 }}>
          {summary}
        </span>
      )}
    </div>
  );
}
