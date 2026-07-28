import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createPosition, listPositions } from "@/lib/data/positions";

export async function GET() {
  const positions = await listPositions();
  return NextResponse.json(positions);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome da posição é obrigatório." }, { status: 400 });
  }

  const position = await createPosition(name);
  revalidatePath("/technical/competencies");
  revalidatePath("/technical/legend");
  return NextResponse.json(position, { status: 201 });
}
