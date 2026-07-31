import { Kpi } from "./types";

// Pesos e critérios a partir do Excel final do departamento de scouting
// ("Psychological_KPIs_scouting_PT versão 2.xlsx"). Os critérios de cada KPI vêm
// agrupados em três categorias, consoante a forma como podem ser observados: um
// scout que só vê vídeo/Wyscout não tem acesso ao balneário ou a áudio de bancada.
export const KPIS: Kpi[] = [
  {
    id: "coragem",
    name: "Coragem",
    peso: 8,
    cadence: "por_jogo",
    criteriosVideo: [
      "Assume situações de risco expondo-se",
      "Arrisca no finalizar",
      "Dá linhas de passe",
      "Postura corporal adequada (cabeça erguida)",
    ],
    criteriosAoVivo: [
      "Lida positivamente com a adversidade do público (assobios) — áudio de bancada raramente identificável em vídeo de transmissão",
    ],
    criteriosInferencial: [],
  },
  {
    id: "agressividade",
    name: "Agressividade",
    peso: 4,
    cadence: "por_jogo",
    criteriosVideo: [
      "Procura a bola",
      "Movimenta-se e está ativo em campo",
      "Entra nos duelos com agressividade",
      "Impõe-se fisicamente",
    ],
    criteriosAoVivo: [
      "\"Expressão facial de combate\" — só percetível em close-ups ocasionais",
    ],
    criteriosInferencial: [
      "Confortável no confronto físico (estado inferido a partir do padrão de comportamento acima)",
    ],
  },
  {
    id: "resiliencia",
    name: "Resiliência",
    peso: 10,
    cadence: "por_jogo",
    criteriosVideo: [
      "Esforça-se mesmo cansado — mantém-se ativo, procura linhas de passe e a bola",
      "Esforça-se quando está a perder — mantém-se ativo, procura linhas de passe e a bola",
      "Continua a jogar com dor/lesionado (exige confirmação do estado físico junto do clube)",
    ],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Tem a robustez mental necessária para lidar com obstáculos incontroláveis do jogo (reformula a própria definição do traço, não é um comportamento em si)",
    ],
  },
  {
    id: "criatividade",
    name: "Criatividade",
    peso: 12,
    cadence: "periodica",
    criteriosVideo: [],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Faz as coisas de forma diferente (comparativo, exige referência)",
      "É imprevisível (subjetivo, exige referência)",
    ],
  },
  {
    id: "autoconfianca",
    name: "Autoconfiança",
    peso: 6,
    cadence: "por_jogo",
    criteriosVideo: [
      "Pede para bater grandes penalidades",
      "Pede para bater livres",
      "Pede a bola constantemente, mesmo em momentos de adversidade",
    ],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Continua a trabalhar para se superar, mesmo já tendo atingido os objetivos pessoais (exige conhecer os objetivos pessoais e acompanhamento ao longo do tempo)",
    ],
  },
  {
    id: "autocontrolo",
    name: "Autocontrolo",
    peso: 6,
    cadence: "por_jogo",
    criteriosVideo: [
      "Não responde a provocações de adversários/colegas",
      "Mantém-se positivo independentemente do resultado (últimos 10 min, casa/fora, jogo fácil/difícil) — requer várias observações para confirmar padrão",
      "Reage positivamente à perda de posse",
    ],
    criteriosAoVivo: [
      "Reage positivamente quando provocado pelo treinador — banco/linha lateral, cobertura de vídeo irregular",
    ],
    criteriosInferencial: [
      "Reage bem a uma falha, após várias jornadas sem marcar (exige conhecer o histórico recente do atleta)",
    ],
  },
  {
    id: "altruismo",
    name: "Altruísmo",
    peso: 4,
    cadence: "por_jogo",
    criteriosVideo: [
      "Assiste em vez de rematar",
      "Ajuda os colegas na defesa mesmo fora da sua zona",
      "Mesmo estando à frente e longe da jogada, esforça-se a recuperar",
    ],
    criteriosAoVivo: [],
    criteriosInferencial: [],
  },
  {
    id: "comunicacao",
    name: "Comunicação",
    peso: 8,
    cadence: "periodica",
    criteriosVideo: [],
    criteriosAoVivo: [
      "Dá indicações adequadas aos colegas (posicionamento e tarefas) — sem microfones em campo, dificilmente confirmável via vídeo",
      "Como suplente, apoia a equipa a partir do banco — banco raramente filmado em detalhe",
    ],
    criteriosInferencial: [
      "É ouvido pelos outros (efeito sobre o grupo, difícil de confirmar independentemente do meio)",
    ],
  },
  {
    id: "atitude_competitiva",
    name: "Atitude competitiva",
    peso: 10,
    cadence: "por_jogo",
    criteriosVideo: [
      "Mantém-se focado nas suas tarefas",
      "Ataca e defende, está sempre ativo mesmo sem bola e longe dela",
    ],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Bloqueia fatores de distração (estado interno inferido)",
    ],
  },
  {
    id: "lideranca",
    name: "Liderança",
    peso: 8,
    cadence: "periodica",
    criteriosVideo: [
      "Emerge como líder em situações difíceis (visível em gestos e organização em campo)",
    ],
    criteriosAoVivo: [
      "Encoraja colegas quando as coisas correm mal — normalmente verbal, mais fiável ao vivo ou com áudio de bancada",
    ],
    criteriosInferencial: [
      "A sua alegria é contagiante (efeito subjetivo sobre o grupo)",
      "É seguido pelos colegas em situações adversas (julgamento de grupo, exige histórico)",
      "Serve de referência nos intervalos (exige acesso ao balneário)",
      "Os colegas procuram a sua orientação (exige acesso a bastidores)",
      "Facilita a resolução de conflitos (exige acesso a bastidores)",
      "Faz a ponte com os treinadores (exige acesso a bastidores)",
    ],
  },
  {
    id: "ambicao",
    name: "Ambição",
    peso: 10,
    cadence: "periodica",
    criteriosVideo: [],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Aceita e cria objetivos desafiantes para si, nunca satisfeito com o que alcança (exige conhecimento longitudinal dos objetivos pessoais)",
      "Em todos os jogos e treinos procura ser melhor que no anterior (exige acompanhamento contínuo, incluindo treinos)",
    ],
  },
  {
    id: "tomada_decisao",
    name: "Tomada de decisão",
    peso: 14,
    cadence: "por_jogo",
    criteriosVideo: [
      "Sabe quando parar o jogo e quando acelerar/desacelerar o ritmo",
      "Lê o jogo e joga em antecipação (defesa), move-se para bloquear passes",
      "(GK) Lê a linguagem corporal do adversário nos penáltis e reage em conformidade",
    ],
    criteriosAoVivo: [],
    criteriosInferencial: [
      "Lê o jogo e responde adequadamente a todas as situações que o jogo coloca (juízo agregado de várias ações, não um comportamento único)",
      "Tem um repertório amplo de ações para responder ao que o momento exige (juízo agregado)",
      "Conhece as características dos colegas (exige informação de bastidores/treinos)",
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
