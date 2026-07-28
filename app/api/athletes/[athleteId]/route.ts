import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteAthlete, renameAthlete } from "@/lib/data/athletes";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome do atleta é obrigatório." }, { status: 400 });
  }

  const athlete = await renameAthlete(athleteId, name);
  revalidatePath(`/teams/${athlete.teamId}`);
  revalidatePath(`/teams/${athlete.teamId}/athletes/${athleteId}`);
  return NextResponse.json(athlete);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const athlete = await deleteAthlete(athleteId);
  revalidatePath(`/teams/${athlete.teamId}`);
  return NextResponse.json({ ok: true });
}
