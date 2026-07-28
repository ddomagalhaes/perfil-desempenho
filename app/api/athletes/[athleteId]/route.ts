import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteAthlete, renameAthlete, setAthletePosition } from "@/lib/data/athletes";

function revalidateAthlete(teamId: string, athleteId: string) {
  for (const area of ["psychological", "technical"]) {
    revalidatePath(`/${area}/teams/${teamId}`);
    revalidatePath(`/${area}/teams/${teamId}/athletes/${athleteId}`);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const body = await request.json().catch(() => null);

  let athlete;

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Nome do atleta é obrigatório." }, { status: 400 });
    }
    athlete = await renameAthlete(athleteId, name);
  }

  if (body && "positionId" in body) {
    const positionId = typeof body.positionId === "string" ? body.positionId : null;
    athlete = await setAthletePosition(athleteId, positionId);
  }

  if (!athlete) {
    return NextResponse.json(
      { error: "Nada para atualizar (name e/ou positionId)." },
      { status: 400 }
    );
  }

  revalidateAthlete(athlete.teamId, athleteId);
  return NextResponse.json(athlete);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const athlete = await deleteAthlete(athleteId);
  revalidateAthlete(athlete.teamId, athleteId);
  return NextResponse.json({ ok: true });
}
