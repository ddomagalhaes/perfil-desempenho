import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createPerGameEvaluation, createPeriodicEvaluation } from "@/lib/data/scoutingEvaluations";

function isScoreMap(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((v) => typeof v === "number")
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const prospectId = typeof body?.prospectId === "string" ? body.prospectId : "";
  const cadence = body?.cadence;
  const scores = body?.scores;

  if (!prospectId || !isScoreMap(scores)) {
    return NextResponse.json(
      { error: "prospectId e scores (mapa de números) são obrigatórios." },
      { status: 400 }
    );
  }

  if (cadence === "por_jogo") {
    if (typeof body?.context !== "object" || body.context === null) {
      return NextResponse.json({ error: "context é obrigatório para cadence=por_jogo." }, { status: 400 });
    }
    await createPerGameEvaluation({ prospectId, scores, context: body.context });
  } else if (cadence === "periodica") {
    const notas = typeof body?.notas === "string" ? body.notas : "";
    await createPeriodicEvaluation({ prospectId, scores, notas });
  } else {
    return NextResponse.json(
      { error: "cadence deve ser 'por_jogo' ou 'periodica'." },
      { status: 400 }
    );
  }

  revalidatePath(`/scouting/prospects/${prospectId}/evaluate`);
  return NextResponse.json({ ok: true });
}
