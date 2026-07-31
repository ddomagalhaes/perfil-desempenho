export type PosicaoCodigo = "DC" | "DL" | "MC" | "EX" | "AV";

export interface RespostaFormulario {
  nome: string;
  carimbo: number;
  posicaoCodigo: PosicaoCodigo;
  valores: number[]; // pontuações 0-10, na ordem das competências dessa posição
}

export interface RespostaIgnorada {
  linha: number; // número da linha no ficheiro (1-based, incluindo cabeçalho)
  nome: string;
  motivo: string;
}

export interface ParseResult {
  respostas: RespostaFormulario[];
  ignoradas: RespostaIgnorada[];
}
