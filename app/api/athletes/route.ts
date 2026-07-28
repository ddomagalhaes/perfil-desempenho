import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAthlete } from "@/lib/data/athletes";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const teamId = typeof body?.teamId === "string" ? body.teamId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!teamId || !name) {
    return NextResponse.json(
      { error: "teamId e name são obrigatórios." },
      { status: 400 }
    );
  }

  const athlete = await createAthlete(teamId, name);
  revalidatePath(`/teams/${teamId}`);
  return NextResponse.json(athlete, { status: 201 });
}
