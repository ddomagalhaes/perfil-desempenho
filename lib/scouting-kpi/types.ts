export type Cadence = "por_jogo" | "periodica";

export interface AnchorBand {
  range: string; // e.g. "9-10"
  label: string; // e.g. "Excelente"
  description: string;
}

export interface Kpi {
  id: string;
  name: string;
  peso: number; // weight, all "por_jogo" + "periodica" weights sum to 100
  cadence: Cadence;
  hint: string; // short one-line reminder shown under the slider
  criterios: string[]; // fuller behavioral anchors, shown on "ver critérios"
  bandas: AnchorBand[]; // 5-band draft scale, for validation with the department
}

export interface GameContext {
  jogoId: string;
  adversario: string;
  data: string; // ISO date
  posicao: string;
  dificuldade: "Alta" | "Média" | "Baixa";
  casaOuFora: "Casa" | "Fora";
  resultado: "Vitória" | "Derrota" | "Empate";
  titularOuSuplente: "Titular" | "Suplente";
  minutoEntrada?: number; // only relevant if Suplente
}

export interface EvaluationEntry {
  jogadorId: string;
  jogoId?: string; // present for "por_jogo" entries
  periodoInicio?: string; // present for "periodica" entries
  periodoFim?: string;
  scores: Record<string, number>; // kpiId -> 0-10
  notas?: string;
  criadoEm: string;
}
