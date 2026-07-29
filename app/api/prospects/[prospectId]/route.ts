import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { archiveProspect, updateProspect } from "@/lib/data/prospects";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  const { prospectId } = await params;
  const body = await request.json().catch(() => null);

  const prospect = await updateProspect(prospectId, {
    name: typeof body?.name === "string" ? body.name : undefined,
    positionId: "positionId" in (body ?? {}) ? body.positionId : undefined,
    club: "club" in (body ?? {}) ? body.club : undefined,
  });

  revalidatePath("/scouting/prospects");
  revalidatePath(`/scouting/prospects/${prospectId}`);
  return NextResponse.json(prospect);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  const { prospectId } = await params;
  await archiveProspect(prospectId);
  revalidatePath("/scouting/prospects");
  return NextResponse.json({ ok: true });
}
