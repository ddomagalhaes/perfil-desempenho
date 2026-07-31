import type { Kpi } from "@/lib/scouting-kpi/types";

const CATEGORIAS: { key: keyof Pick<Kpi, "criteriosVideo" | "criteriosAoVivo" | "criteriosInferencial">; titulo: string }[] = [
  { key: "criteriosVideo", titulo: "Visível em vídeo / Wyscout" },
  { key: "criteriosAoVivo", titulo: "Requer presença ao vivo / áudio" },
  { key: "criteriosInferencial", titulo: "Inferencial / juízo agregado" },
];

/** As três categorias de critérios comportamentais de um KPI, cada uma só
 * aparecendo se tiver conteúdo — usado tanto no "ver critérios" expansível do
 * KpiSliderRow como na página de referência (sempre visível). */
export function KpiCriteriosList({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi-slider-criterios">
      {CATEGORIAS.map(({ key, titulo }) => {
        const items = kpi[key];
        if (items.length === 0) return null;
        return (
          <div key={key} className="kpi-slider-criterios-categoria">
            <strong>{titulo}</strong>
            {items.map((c, i) => (
              <div key={i}>• {c}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
