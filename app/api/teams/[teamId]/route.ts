import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteTeam, renameTeam } from "@/lib/data/teams";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome da equipa é obrigatório." }, { status: 400 });
  }

  const team = await renameTeam(teamId, name);
  revalidatePath("/psychological/teams");
  revalidatePath("/technical/teams");
  revalidatePath(`/psychological/teams/${teamId}`);
  revalidatePath(`/technical/teams/${teamId}`);
  return NextResponse.json(team);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  await deleteTeam(teamId);
  revalidatePath("/psychological/teams");
  revalidatePath("/technical/teams");
  return NextResponse.json({ ok: true });
}
