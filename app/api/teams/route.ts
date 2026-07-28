import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createTeam, listTeams } from "@/lib/data/teams";

export async function GET() {
  const teams = await listTeams();
  return NextResponse.json(teams);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome da equipa é obrigatório." }, { status: 400 });
  }

  const team = await createTeam(name);
  revalidatePath("/teams");
  return NextResponse.json(team, { status: 201 });
}
