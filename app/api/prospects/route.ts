import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createProspect, linkAthleteAsProspect, listProspects } from "@/lib/data/prospects";

export async function GET() {
  const prospects = await listProspects();
  return NextResponse.json(prospects);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (typeof body?.athleteId === "string" && body.athleteId) {
    const prospect = await linkAthleteAsProspect(body.athleteId);
    revalidatePath("/scouting/prospects");
    return NextResponse.json(prospect, { status: 201 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  const positionId = typeof body?.positionId === "string" ? body.positionId : null;
  const club = typeof body?.club === "string" ? body.club : null;

  const prospect = await createProspect({ name, positionId, club });
  revalidatePath("/scouting/prospects");
  return NextResponse.json(prospect, { status: 201 });
}
