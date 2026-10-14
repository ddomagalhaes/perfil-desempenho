import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { replaceSlots, type SlotInput } from "@/lib/data/students";

function parseSlot(value: unknown): SlotInput | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const { startMin, endMin } = v;
  if (
    typeof startMin !== "number" ||
    typeof endMin !== "number" ||
    !Number.isInteger(startMin) ||
    !Number.isInteger(endMin) ||
    startMin < 0 ||
    endMin > 24 * 60 ||
    endMin <= startMin
  ) {
    return null;
  }
  return {
    id: typeof v.id === "string" ? v.id : undefined,
    startMin,
    endMin,
    kind: v.kind === "BREAK" ? "BREAK" : "LESSON",
    label: typeof v.label === "string" ? v.label : "",
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.slots)) {
    return NextResponse.json({ error: "Lista de blocos em falta." }, { status: 400 });
  }

  const slots = body.slots.map(parseSlot);
  if (slots.some((s: SlotInput | null) => s === null)) {
    return NextResponse.json(
      { error: "Há blocos com horas inválidas (o fim tem de ser depois do início)." },
      { status: 400 }
    );
  }

  await replaceSlots(studentId, slots as SlotInput[]);
  revalidatePath("/school", "layout");
  return NextResponse.json({ ok: true });
}
