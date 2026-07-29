import { Kpi } from "./types";

// Pesos e conteúdo revistos a partir do Excel original do departamento de scouting.
// As "bandas" são um RASCUNHO para validar com o departamento, não uma versão final.
export const KPIS: Kpi[] = [
  {
    id: "coragem",
    name: "Coragem",
    peso: 8,
    cadence: "por_jogo",
    hint: "arrisca no finalizar, dá linhas de passe",
    criterios: [
      "Assume situações de risco expondo-se",
      "Arrisca no finalizar",
      "Dá linhas de passe",
      "Postura corporal adequada (cabeça erguida)",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Assume risco e arrisca no finalizar em praticamente todas as oportunidades, mesmo sob pressão máxima" },
      { range: "7-8", label: "Muito Bom", description: "Assume risco na maioria das situações, com hesitação ocasional em momentos de maior exposição" },
      { range: "5-6", label: "Bom", description: "Assume risco em situações mais seguras, mas evita quando a exposição é maior" },
      { range: "3-4", label: "Insuficiente", description: "Raramente arrisca, mesmo quando a situação de jogo o permite claramente" },
      { range: "0-2", label: "Preocupante", description: "Evita sistematicamente o risco e a exposição, mesmo em situações favoráveis" },
    ],
  },
  {
    id: "agressividade",
    name: "Agressividade",
    peso: 4,
    cadence: "por_jogo",
    hint: "procura a bola, entra nos duelos, impõe-se fisicamente",
    criterios: [
      "Procura a bola",
      "Movimenta-se e está ativo em campo",
      "Entra nos duelos com agressividade",
      "Impõe-se fisicamente",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Impõe-se fisicamente e entra em todos os duelos relevantes com intensidade máxima" },
      { range: "7-8", label: "Muito Bom", description: "Entra na maioria dos duelos com intensidade, com quebras pontuais" },
      { range: "5-6", label: "Bom", description: "Entra em duelos de forma inconsistente, com intensidade variável" },
      { range: "3-4", label: "Insuficiente", description: "Evita a maioria dos duelos físicos, procura-os raramente" },
      { range: "0-2", label: "Preocupante", description: "Evita sistematicamente o confronto físico" },
    ],
  },
  {
    id: "resiliencia",
    name: "Resiliência",
    peso: 10,
    cadence: "por_jogo",
    hint: "esforça-se cansado/a perder, joga com dor",
    criterios: [
      "Esforça-se mesmo cansado",
      "Esforça-se quando está a perder",
      "Continua a jogar com dor/lesionado",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Mantém o nível de esforço em praticamente todas as situações adversas (cansaço, défice, dor)" },
      { range: "7-8", label: "Muito Bom", description: "Mantém esforço na maioria das situações adversas, com quebras pontuais" },
      { range: "5-6", label: "Bom", description: "Mantém esforço nalgumas situações adversas, mas quebra noutras semelhantes" },
      { range: "3-4", label: "Insuficiente", description: "Quebra o esforço na maioria das situações adversas" },
      { range: "0-2", label: "Preocupante", description: "Desiste ou reduz visivelmente o esforço perante qualquer adversidade" },
    ],
  },
  {
    id: "criatividade",
    name: "Criatividade",
    peso: 12,
    cadence: "periodica",
    hint: "faz as coisas de forma diferente, é imprevisível",
    criterios: ["Faz as coisas de forma diferente", "É imprevisível"],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Produz soluções distintas e imprevisíveis de forma consistente ao longo do jogo" },
      { range: "7-8", label: "Muito Bom", description: "Produz soluções diferentes com frequência, mas com padrões repetíveis" },
      { range: "5-6", label: "Bom", description: "Produz soluções diferentes ocasionalmente, na maioria segue padrões previsíveis" },
      { range: "3-4", label: "Insuficiente", description: "Raramente foge ao padrão esperado" },
      { range: "0-2", label: "Preocupante", description: "Comportamento totalmente previsível, sem variação" },
    ],
  },
  {
    id: "autoconfianca",
    name: "Autoconfiança",
    peso: 6,
    cadence: "por_jogo",
    hint: "pede penáltis/livres, pede a bola",
    criterios: [
      "Pede para bater grandes penalidades",
      "Pede para bater livres",
      "Pede a bola constantemente, mesmo em adversidade",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Procura sistematicamente responsabilidade acrescida (bola, penáltis, livres) em qualquer contexto" },
      { range: "7-8", label: "Muito Bom", description: "Procura responsabilidade acrescida na maioria das situações" },
      { range: "5-6", label: "Bom", description: "Procura responsabilidade acrescida de forma inconsistente" },
      { range: "3-4", label: "Insuficiente", description: "Raramente procura responsabilidade acrescida, mesmo quando indicado" },
      { range: "0-2", label: "Preocupante", description: "Evita sistematicamente responsabilidade acrescida" },
    ],
  },
  {
    id: "autocontrolo",
    name: "Autocontrolo",
    peso: 6,
    cadence: "por_jogo",
    hint: "não responde a provocações, mantém-se positivo",
    criterios: [
      "Não responde a provocações de adversários/colegas",
      "Mantém-se positivo independentemente do resultado",
      "Reage positivamente à perda de posse",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Mantém-se emocionalmente estável em praticamente todas as situações de provocação/adversidade" },
      { range: "7-8", label: "Muito Bom", description: "Mantém-se estável na maioria das situações, com quebras pontuais" },
      { range: "5-6", label: "Bom", description: "Estabilidade inconsistente perante provocação/adversidade" },
      { range: "3-4", label: "Insuficiente", description: "Reage mal com frequência a provocação/adversidade" },
      { range: "0-2", label: "Preocupante", description: "Perde o controlo emocional de forma sistemática" },
    ],
  },
  {
    id: "altruismo",
    name: "Altruísmo",
    peso: 4,
    cadence: "por_jogo",
    hint: "assiste em vez de rematar, ajuda fora da zona",
    criterios: [
      "Assiste em vez de rematar",
      "Ajuda os colegas na defesa mesmo fora da sua zona",
      "Esforça-se a recuperar mesmo à frente e longe da jogada",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Prioriza sistematicamente o benefício da equipa sobre o benefício individual" },
      { range: "7-8", label: "Muito Bom", description: "Prioriza a equipa na maioria das situações" },
      { range: "5-6", label: "Bom", description: "Prioriza a equipa de forma inconsistente" },
      { range: "3-4", label: "Insuficiente", description: "Raramente prioriza a equipa sobre o benefício individual" },
      { range: "0-2", label: "Preocupante", description: "Prioriza sistematicamente o benefício individual" },
    ],
  },
  {
    id: "comunicacao",
    name: "Comunicação",
    peso: 8,
    cadence: "periodica",
    hint: "indicações aos colegas, apoio do banco",
    criterios: [
      "Dá indicações adequadas aos colegas (posicionamento e tarefas)",
      "Como suplente, apoia a equipa a partir do banco",
      "É ouvido pelos outros",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Comunica de forma clara e eficaz em praticamente todas as situações de jogo" },
      { range: "7-8", label: "Muito Bom", description: "Comunica de forma eficaz na maioria das situações" },
      { range: "5-6", label: "Bom", description: "Comunicação inconsistente, presente nalgumas situações" },
      { range: "3-4", label: "Insuficiente", description: "Comunica raramente, mesmo quando necessário" },
      { range: "0-2", label: "Preocupante", description: "Praticamente ausente de comunicação com os colegas" },
    ],
  },
  {
    id: "atitude_competitiva",
    name: "Atitude competitiva",
    peso: 10,
    cadence: "por_jogo",
    hint: "focado nas tarefas, sempre ativo sem bola",
    criterios: [
      "Mantém-se focado nas suas tarefas",
      "Ataca e defende, sempre ativo mesmo sem bola e longe dela",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Mantém foco e intensidade em praticamente todas as fases do jogo, independentemente do contexto" },
      { range: "7-8", label: "Muito Bom", description: "Mantém foco e intensidade na maioria das fases do jogo" },
      { range: "5-6", label: "Bom", description: "Foco e intensidade inconsistentes ao longo do jogo" },
      { range: "3-4", label: "Insuficiente", description: "Perde foco e intensidade com frequência" },
      { range: "0-2", label: "Preocupante", description: "Desliga-se do jogo com frequência, independentemente do contexto" },
    ],
  },
  {
    id: "lideranca",
    name: "Liderança",
    peso: 8,
    cadence: "periodica",
    hint: "referência no balneário, ponte com o treinador",
    criterios: [
      "Encoraja colegas quando as coisas correm mal",
      "Emerge como líder em situações difíceis",
      "É seguido pelos colegas em situações adversas",
      "Serve de referência nos intervalos",
      "Facilita a resolução de conflitos",
      "Faz a ponte com os treinadores",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "É referência para o grupo em praticamente todas as situações difíceis" },
      { range: "7-8", label: "Muito Bom", description: "É referência para o grupo na maioria das situações difíceis" },
      { range: "5-6", label: "Bom", description: "Assume papel de liderança de forma inconsistente" },
      { range: "3-4", label: "Insuficiente", description: "Raramente assume papel de liderança, mesmo quando solicitado" },
      { range: "0-2", label: "Preocupante", description: "Nunca assume papel de liderança" },
    ],
  },
  {
    id: "ambicao",
    name: "Ambição",
    peso: 10,
    cadence: "periodica",
    hint: "objetivos pessoais, evolução treino a treino",
    criterios: [
      "Aceita e cria objetivos desafiantes para si, nunca satisfeito com o que alcança",
      "Em todos os jogos e treinos procura ser melhor que no anterior",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Procura sistematicamente superar-se, mesmo acima dos objetivos já alcançados" },
      { range: "7-8", label: "Muito Bom", description: "Procura superar-se na maioria das situações" },
      { range: "5-6", label: "Bom", description: "Procura superar-se de forma inconsistente" },
      { range: "3-4", label: "Insuficiente", description: "Raramente procura ir além do que já é exigido" },
      { range: "0-2", label: "Preocupante", description: "Sem evidência de procura de superação pessoal" },
    ],
  },
  {
    id: "tomada_decisao",
    name: "Tomada de decisão",
    peso: 14,
    cadence: "por_jogo",
    hint: "lê o jogo, antecipação, gere o ritmo",
    criterios: [
      "Sabe quando parar o jogo e quando acelerar/desacelerar o ritmo",
      "Lê o jogo e joga em antecipação, move-se para bloquear passes",
      "(GK) Lê a linguagem corporal do adversário nos penáltis",
    ],
    bandas: [
      { range: "9-10", label: "Excelente", description: "Lê o jogo e antecipa em praticamente todas as jogadas relevantes, gere o ritmo com naturalidade" },
      { range: "7-8", label: "Muito Bom", description: "Antecipa na maioria das situações, com falhas pontuais em momentos de maior pressão" },
      { range: "5-6", label: "Bom", description: "Antecipa em jogadas simples, mas falha a ler situações mais complexas ou rápidas" },
      { range: "3-4", label: "Insuficiente", description: "Raramente antecipa, reage tarde à generalidade das jogadas" },
      { range: "0-2", label: "Preocupante", description: "Joga quase sempre em atraso face à jogada" },
    ],
  },
];

export const KPIS_POR_JOGO = KPIS.filter((k) => k.cadence === "por_jogo");
export const KPIS_PERIODICAS = KPIS.filter((k) => k.cadence === "periodica");

export function pesoTotal(kpis: Kpi[]): number {
  return kpis.reduce((sum, k) => sum + k.peso, 0);
}

export function scorePonderado(kpis: Kpi[], scores: Record<string, number>): number {
  const total = pesoTotal(kpis);
  if (total === 0) return 0;
  const soma = kpis.reduce((sum, k) => sum + (scores[k.id] ?? 0) * k.peso, 0);
  return Math.round((soma / total) * 10) / 10;
}
