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
};

export async function createPerGameEvaluation(input: {
  prospectId: string;
  scores: Record<string, number>;
  context: GameContext;
  avaliador: string;
}): Promise<{ id: string }> {
  const created = await prisma.scoutingEvaluation.create({
    data: {
      prospectId: input.prospectId,
      cadence: "POR_JOGO",
      scores: input.scores,
      gameContext: input.context as unknown as Prisma.InputJsonValue,
      avaliador: input.avaliador,
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

export type EvaluationDetail = {
  id: string;
  cadence: EvaluationCadence;
  scores: Record<string, number>;
  notas: string;
  avaliador: string;
  periodo: string;
  gameContext: GameContext | null;
  createdAt: string;
  prospectId: string;
  prospectName: string;
  prospectPositionName: string | null;
};

/** Uma avaliação completa, com os dados do prospeto já juntos — usada só pela
 * página de impressão/PDF, que precisa do nome e posição para o cabeçalho. */
export async function getEvaluationById(id: string): Promise<EvaluationDetail | null> {
  const row = await prisma.scoutingEvaluation.findUnique({
    where: { id },
    include: { prospect: { include: { position: true } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    cadence: row.cadence,
    scores: row.scores as Record<string, number>,
    notas: row.notas,
    avaliador: row.avaliador,
    periodo: row.periodo,
    gameContext: (row.gameContext as unknown as GameContext | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    prospectId: row.prospectId,
    prospectName: row.prospect.name,
    prospectPositionName: row.prospect.position?.name ?? null,
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
  }));
}
