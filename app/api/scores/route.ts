import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertScore } from "@/lib/data/scores";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const athleteId = typeof body?.athleteId === "string" ? body.athleteId : "";
  const competencyId = typeof body?.competencyId === "string" ? body.competencyId : "";
  const value = typeof body?.value === "number" ? body.value : NaN;

  if (!athleteId || !competencyId || Number.isNaN(value)) {
    return NextResponse.json(
      { error: "athleteId, competencyId e value (número) são obrigatórios." },
      { status: 400 }
    );
  }

  const clamped = await upsertScore(athleteId, competencyId, value);

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (athlete) {
    for (const area of ["psychological", "technical"]) {
      revalidatePath(`/${area}/teams/${athlete.teamId}`);
      revalidatePath(`/${area}/teams/${athlete.teamId}/athletes/${athleteId}`);
    }
  }

  return NextResponse.json({ value: clamped });
}
