import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { archivePosition, renamePosition } from "@/lib/data/positions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nome da posição é obrigatório." }, { status: 400 });
  }

  const position = await renamePosition(positionId, name);
  revalidatePath("/technical/competencies");
  revalidatePath("/technical/legend");
  revalidatePath("/technical/compare");
  return NextResponse.json(position);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;
  await archivePosition(positionId);
  revalidatePath("/technical/competencies");
  revalidatePath("/technical/legend");
  revalidatePath("/technical/compare");
  return NextResponse.json({ ok: true });
}
