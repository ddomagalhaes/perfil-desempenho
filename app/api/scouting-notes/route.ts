import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertScoutingNote } from "@/lib/data/prospects";

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const prospectId = typeof body?.prospectId === "string" ? body.prospectId : "";
  const competencyId = typeof body?.competencyId === "string" ? body.competencyId : "";
  const note = typeof body?.note === "string" ? body.note : "";

  if (!prospectId || !competencyId) {
    return NextResponse.json(
      { error: "prospectId e competencyId são obrigatórios." },
      { status: 400 }
    );
  }

  await upsertScoutingNote(prospectId, competencyId, note);
  revalidatePath(`/scouting/prospects/${prospectId}`);
  revalidatePath("/scouting/compare");
  return NextResponse.json({ ok: true });
}
