import type { ParseResult, PosicaoCodigo, RespostaFormulario } from "./types";

// Estrutura fixa do export do Google Forms (cabeçalho com 42 colunas): as 3
// primeiras são carimbo/nome/posição, seguidas de 5 blocos de competências (um
// por posição), sempre pela mesma ordem. Os nomes de coluna do Excel repetem-se
// com sufixos ("Velocidade" vs "Velocidade / Speed 2") por causa de perguntas
// reutilizadas em secções diferentes do formulário, por isso mapeamos por
// intervalo de índice de coluna em vez de por nome de coluna.
const COLUMN_RANGES: Record<PosicaoCodigo, [number, number]> = {
  DC: [3, 11],
  DL: [11, 18],
  MC: [18, 26],
  EX: [26, 34],
  AV: [34, 42],
};

const EXPECTED_HEADER_LENGTH = 42;

// Nome da posição tal como configurado em /technical/competencies (produção já
// tem estas 5 posições criadas pelos treinadores, com as competências pela
// mesma ordem das colunas do Excel de cada bloco).
export const POSICAO_NOME_PT: Record<PosicaoCodigo, string> = {
  DC: "Defesa Central",
  DL: "Defesa Lateral",
  MC: "Médio Centro",
  EX: "Extremos",
  AV: "Avançado",
};

export function detectarPosicao(texto: string): PosicaoCodigo | null {
  const codigo = texto.split("/")[0]?.trim().toUpperCase();
  if (codigo === "DC" || codigo === "DL" || codigo === "MC" || codigo === "EX" || codigo === "AV") {
    return codigo;
  }
  return null;
}

/**
 * `linhas` é o resultado de `XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })`
 * — a primeira linha é o cabeçalho do Google Forms e é ignorada aqui.
 */
export function parseRespostasFormulario(linhas: unknown[][]): ParseResult {
  const respostas: RespostaFormulario[] = [];
  const ignoradas: ParseResult["ignoradas"] = [];

  const header = linhas[0];
  if (!header || header.length < EXPECTED_HEADER_LENGTH) {
    throw new Error(
      `Cabeçalho do Excel tem ${header?.length ?? 0} colunas, esperava ${EXPECTED_HEADER_LENGTH}. O formato do ficheiro pode ter mudado.`
    );
  }

  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i];
    const numeroLinha = i + 1;
    const nome = String(linha[1] ?? "").trim();
    const posicaoTexto = String(linha[2] ?? "").trim();

    if (!nome) {
      ignoradas.push({ linha: numeroLinha, nome, motivo: "sem nome" });
      continue;
    }

    const posicaoCodigo = detectarPosicao(posicaoTexto);
    if (!posicaoCodigo) {
      ignoradas.push({ linha: numeroLinha, nome, motivo: `posição não reconhecida: "${posicaoTexto}"` });
      continue;
    }

    const [start, end] = COLUMN_RANGES[posicaoCodigo];
    const valores: number[] = [];
    for (let col = start; col < end; col++) {
      const valor = Number(linha[col]);
      valores.push(Number.isFinite(valor) ? valor : 0);
    }

    const carimbo = Number(linha[0]);
    respostas.push({
      nome,
      carimbo: Number.isFinite(carimbo) ? carimbo : 0,
      posicaoCodigo,
      valores,
    });
  }

  return { respostas, ignoradas };
}

/** Se o mesmo nome (case-insensitive, sem espaços nas pontas) submeteu o formulário
 * mais do que uma vez, mantém só a resposta com o carimbo de data/hora mais recente. */
export function manterRespostasMaisRecentes(respostas: RespostaFormulario[]): RespostaFormulario[] {
  const maisRecentePorNome = new Map<string, RespostaFormulario>();

  for (const resposta of respostas) {
    const chave = resposta.nome.toLowerCase();
    const atual = maisRecentePorNome.get(chave);
    if (!atual || resposta.carimbo > atual.carimbo) {
      maisRecentePorNome.set(chave, resposta);
    }
  }

  return Array.from(maisRecentePorNome.values());
}
