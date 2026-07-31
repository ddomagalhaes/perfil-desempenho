export type Cadence = "por_jogo" | "periodica";

export interface Kpi {
  id: string;
  name: string;
  peso: number; // weight, all "por_jogo" + "periodica" weights sum to 100
  cadence: Cadence;
  // Critérios comportamentais, agrupados pela forma como podem ser observados —
  // um scout de vídeo não tem acesso ao balneário, por exemplo.
  criteriosVideo: string[]; // visível em vídeo/Wyscout (imagens de jogo)
  criteriosAoVivo: string[]; // requer presença ao vivo ou áudio (banco, bastidores)
  criteriosInferencial: string[]; // juízo agregado a partir de histórico/múltiplas observações
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
