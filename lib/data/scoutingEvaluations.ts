import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { EvaluationCadence } from "@/app/generated/prisma/enums";
import type { GameContext } from "@/lib/scouting-kpi/types";
import {
  KPIS,
  KPIS_PERIODICAS,
  KPIS_POR_JOGO,
  bandaParaValor,
  scorePonderado,
  type Banda,
} from "@/lib/scouting-kpi/kpiData";

export type EvaluationHistoryEntry = {
  id: string;
  cadence: EvaluationCadence;
  scores: Record<string, number>;
  notas: string;
  createdAt: string;
  periodo: string;
  gameContext: GameContext | null;
};

export async function createPerGameEvaluation(input: {
  prospectId: string;
  scores: Record<string, number>;
  context: GameContext;
  avaliador: string;
  notas?: string;
}): Promise<{ id: string }> {
  const created = await prisma.scoutingEvaluation.create({
    data: {
      prospectId: input.prospectId,
      cadence: "POR_JOGO",
      scores: input.scores,
      gameContext: input.context as unknown as Prisma.InputJsonValue,
      avaliador: input.avaliador,
      notas: input.notas ?? "",
    },
  });
  return { id: created.id };
}

export async function createPeriodicEvaluation(input: {
  prospectId: string;
  scores: Record<string, number>;
  notas: string;
  avaliador: string;
  periodo: string;
}): Promise<{ id: string }> {
  const created = await prisma.scoutingEvaluation.create({
    data: {
      prospectId: input.prospectId,
      cadence: "PERIODICA",
      scores: input.scores,
      notas: input.notas,
      avaliador: input.avaliador,
      periodo: input.periodo,
    },
  });
  return { id: created.id };
}

export type EvaluationHalf = {
  id: string;
  cadence: EvaluationCadence;
  scores: Record<string, number>;
  periodo: string;
  gameContext: GameContext | null;
  createdAt: string;
  /** Pontuações da avaliação anterior do mesmo prospeto E da mesma cadência
   * (nunca comparamos "por jogo" com "periódica") — null se esta for a
   * primeira. Usado no PDF para mostrar a variação por competência. */
  previousScores: Record<string, number> | null;
};

export type EvaluationDetail = {
  avaliador: string;
  notas: string;
  createdAt: string;
  prospectId: string;
  prospectName: string;
  prospectPositionName: string | null;
  /** null quando essa cadência não foi preenchida nesta sessão de avaliação
   * (ou não há nenhuma suficientemente próxima no tempo para se considerar a
   * mesma sessão) — o PDF mostra só a tabela que existir, nunca inventa a
   * outra. */
  porJogo: EvaluationHalf | null;
  periodica: EvaluationHalf | null;
};

const PAIR_WINDOW_MS = 5 * 60 * 1000;

/** Encontra, para o mesmo prospeto, a avaliação da OUTRA cadência mais
 * próxima no tempo de `createdAt` — só conta como "da mesma sessão" se
 * estiver a menos de 5 minutos de distância (são gravadas uma a seguir à
 * outra, no mesmo clique de "Guardar"/"Gerar PDF"). */
async function findPairedEvaluation(
  prospectId: string,
  otherCadence: EvaluationCadence,
  createdAt: Date,
  excludeId: string
) {
  const candidates = await prisma.scoutingEvaluation.findMany({
    where: { prospectId, cadence: otherCadence, id: { not: excludeId } },
  });

  let closest: (typeof candidates)[number] | null = null;
  let closestDiff = Infinity;
  for (const c of candidates) {
    const diff = Math.abs(c.createdAt.getTime() - createdAt.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = c;
    }
  }
  return closest && closestDiff <= PAIR_WINDOW_MS ? closest : null;
}

async function previousScoresFor(
  prospectId: string,
  cadence: EvaluationCadence,
  createdAt: Date
): Promise<Record<string, number> | null> {
  const previous = await prisma.scoutingEvaluation.findFirst({
    where: { prospectId, cadence, createdAt: { lt: createdAt } },
    orderBy: { createdAt: "desc" },
    select: { scores: true },
  });
  return (previous?.scores as Record<string, number> | undefined) ?? null;
}

function toHalf(
  row: {
    id: string;
    cadence: EvaluationCadence;
    scores: unknown;
    periodo: string;
    gameContext: unknown;
    createdAt: Date;
  },
  previousScores: Record<string, number> | null
): EvaluationHalf {
  return {
    id: row.id,
    cadence: row.cadence,
    scores: row.scores as Record<string, number>,
    periodo: row.periodo,
    gameContext: (row.gameContext as unknown as GameContext | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    previousScores,
  };
}

/** Uma avaliação completa para o PDF — junta a avaliação pedida com a da
 * outra cadência mais próxima no tempo (a "sessão" em que foram gravadas
 * juntas), para o documento mostrar sempre as duas tabelas quando existirem,
 * nunca só a que o link apontava. */
export async function getEvaluationById(id: string): Promise<EvaluationDetail | null> {
  const row = await prisma.scoutingEvaluation.findUnique({
    where: { id },
    include: { prospect: { include: { position: true } } },
  });
  if (!row) return null;

  const otherCadence = row.cadence === "POR_JOGO" ? "PERIODICA" : "POR_JOGO";
  const [ownPrevious, pairedRow] = await Promise.all([
    previousScoresFor(row.prospectId, row.cadence, row.createdAt),
    findPairedEvaluation(row.prospectId, otherCadence, row.createdAt, row.id),
  ]);

  const ownHalf = toHalf(row, ownPrevious);
  let pairedHalf: EvaluationHalf | null = null;
  if (pairedRow) {
    const pairedPrevious = await previousScoresFor(row.prospectId, pairedRow.cadence, pairedRow.createdAt);
    pairedHalf = toHalf(pairedRow, pairedPrevious);
  }

  const porJogo = row.cadence === "POR_JOGO" ? ownHalf : pairedHalf;
  const periodica = row.cadence === "PERIODICA" ? ownHalf : pairedHalf;

  return {
    avaliador: row.avaliador || pairedRow?.avaliador || "",
    notas: row.notas || pairedRow?.notas || "",
    createdAt: row.createdAt.toISOString(),
    prospectId: row.prospectId,
    prospectName: row.prospect.name,
    prospectPositionName: row.prospect.position?.name ?? null,
    porJogo,
    periodica,
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function roundTo1(n: number): number {
  return Math.round(n * 10) / 10;
}

function stdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = average(values) as number;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export type Consistencia = "Consistente" | "Alguma variação" | "Volátil";

function consistenciaLabel(sd: number | null): Consistencia | null {
  if (sd === null) return null;
  if (sd <= 0.8) return "Consistente";
  if (sd <= 1.6) return "Alguma variação";
  return "Volátil";
}

export type TrendPoint = { createdAt: string; value: number };

export type CadenceSummary = {
  n: number;
  average: number | null;
  banda: Banda | null;
  consistencia: Consistencia | null;
  trend: TrendPoint[];
};

function cadenceSummary(
  entries: EvaluationHistoryEntry[],
  kpis: typeof KPIS_POR_JOGO
): CadenceSummary {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const trend = sorted.map((e) => ({ createdAt: e.createdAt, value: scorePonderado(kpis, e.scores) }));
  const values = trend.map((p) => p.value);
  const avg = average(values);
  return {
    n: entries.length,
    average: avg === null ? null : roundTo1(avg),
    banda: avg === null ? null : bandaParaValor(avg),
    consistencia: consistenciaLabel(stdDev(values)),
    trend,
  };
}

export type KpiProfile = {
  kpiId: string;
  name: string;
  peso: number;
  cadence: "por_jogo" | "periodica";
  average: number | null;
  n: number;
  banda: Banda | null;
  trend: TrendPoint[];
  peerAverage: number | null;
  peerN: number;
};

export type ProspectProfile = {
  porJogo: CadenceSummary;
  periodica: CadenceSummary;
  kpis: KpiProfile[];
  position: { id: string; name: string } | null;
  peerCount: number;
};

/** Perfil de um prospeto construído a partir do histórico de avaliações já
 * gravado — nada disto vem de eventos de jogo (não há essa fonte de dados
 * ainda). A comparação de "pares" é só dentro dos nossos próprios prospetos
 * da mesma posição, nunca "global": não temos população para isso. */
export async function getProspectProfile(prospectId: string): Promise<ProspectProfile> {
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: { positionId: true, position: { select: { id: true, name: true } } },
  });

  const entries = await listEvaluations(prospectId);
  const porJogoEntries = entries.filter((e) => e.cadence === "POR_JOGO");
  const periodicaEntries = entries.filter((e) => e.cadence === "PERIODICA");

  const porJogo = cadenceSummary(porJogoEntries, KPIS_POR_JOGO);
  const periodica = cadenceSummary(periodicaEntries, KPIS_PERIODICAS);

  const peerScoresByKpi: Record<string, number[]> = {};
  let peerCount = 0;
  if (prospect?.positionId) {
    const peers = await prisma.prospect.findMany({
      where: { positionId: prospect.positionId, archivedAt: null, id: { not: prospectId } },
      select: { id: true },
    });
    peerCount = peers.length;
    if (peers.length > 0) {
      const peerEvaluations = await prisma.scoutingEvaluation.findMany({
        where: { prospectId: { in: peers.map((p) => p.id) } },
        select: { scores: true },
      });
      for (const ev of peerEvaluations) {
        for (const [kpiId, value] of Object.entries(ev.scores as Record<string, number>)) {
          (peerScoresByKpi[kpiId] ??= []).push(value);
        }
      }
    }
  }

  const kpis: KpiProfile[] = KPIS.map((kpi) => {
    const trend = entries
      .filter((e) => kpi.id in e.scores)
      .map((e) => ({ createdAt: e.createdAt, value: e.scores[kpi.id] }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const values = trend.map((p) => p.value);
    const avg = average(values);
    const peerValues = peerScoresByKpi[kpi.id] ?? [];
    const peerAvg = average(peerValues);
    return {
      kpiId: kpi.id,
      name: kpi.name,
      peso: kpi.peso,
      cadence: kpi.cadence,
      average: avg === null ? null : roundTo1(avg),
      n: values.length,
      banda: avg === null ? null : bandaParaValor(avg),
      trend,
      peerAverage: peerAvg === null ? null : roundTo1(peerAvg),
      peerN: peerValues.length,
    };
  });

  return {
    porJogo,
    periodica,
    kpis,
    position: prospect?.position ? { id: prospect.position.id, name: prospect.position.name } : null,
    peerCount,
  };
}

/** Histórico de avaliações de scouting de um prospeto, mais recentes primeiro —
 * cada avaliação é um registo independente (uma por jogo/período), não um valor
 * único a substituir. */
export async function listEvaluations(prospectId: string): Promise<EvaluationHistoryEntry[]> {
  const rows = await prisma.scoutingEvaluation.findMany({
    where: { prospectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    cadence: r.cadence,
    scores: r.scores as Record<string, number>,
    notas: r.notas,
    createdAt: r.createdAt.toISOString(),
    periodo: r.periodo,
    gameContext: (r.gameContext as unknown as GameContext | null) ?? null,
  }));
}

export type ProspectEvaluationSummary = {
  prospectId: string;
  /** Número de avaliações "por jogo" registadas — não é o número real de jogos
   * disputados pelo prospeto (não temos essa fonte de dados), por isso é sempre
   * apresentado como "jogos avaliados". */
  gamesEvaluated: number;
  latestScore: number | null;
  latestBanda: Banda | null;
  kpis: { kpiId: string; name: string; average: number | null }[];
};

/** Resumo por prospeto para a lista de Prospetos — só o essencial (nº de
 * avaliações por jogo, score ponderado da avaliação mais recente e a média por
 * KPI), numa única query em vez de repetir getProspectProfile por prospeto. */
export async function listProspectEvaluationSummaries(
  prospectIds: string[]
): Promise<Map<string, ProspectEvaluationSummary>> {
  const result = new Map<string, ProspectEvaluationSummary>();
  if (prospectIds.length === 0) return result;

  const rows = await prisma.scoutingEvaluation.findMany({
    where: { prospectId: { in: prospectIds } },
    orderBy: { createdAt: "desc" },
    select: { prospectId: true, cadence: true, scores: true },
  });

  const byProspect = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!byProspect.has(row.prospectId)) byProspect.set(row.prospectId, []);
    byProspect.get(row.prospectId)!.push(row);
  }

  for (const prospectId of prospectIds) {
    const entries = byProspect.get(prospectId) ?? [];
    const gamesEvaluated = entries.filter((e) => e.cadence === "POR_JOGO").length;

    const latest = entries[0];
    const latestScore = latest
      ? roundTo1(
          scorePonderado(
            latest.cadence === "POR_JOGO" ? KPIS_POR_JOGO : KPIS_PERIODICAS,
            latest.scores as Record<string, number>
          )
        )
      : null;

    const kpis = KPIS.map((kpi) => {
      const values = entries
        .map((e) => (e.scores as Record<string, number>)[kpi.id])
        .filter((v): v is number => v !== undefined);
      const avg = average(values);
      return { kpiId: kpi.id, name: kpi.name, average: avg === null ? null : roundTo1(avg) };
    });

    result.set(prospectId, {
      prospectId,
      gamesEvaluated,
      latestScore,
      latestBanda: latestScore === null ? null : bandaParaValor(latestScore),
      kpis,
    });
  }

  return result;
}
