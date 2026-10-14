import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { copySchedule } from "@/lib/data/students";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.fromStudentId !== "string") {
    return NextResponse.json({ error: "Aluno de origem em falta." }, { status: 400 });
  }

  const ok = await copySchedule(body.fromStudentId, studentId);
  if (!ok) return NextResponse.json({ error: "Não foi possível copiar." }, { status: 400 });

  revalidatePath("/school", "layout");
  return NextResponse.json({ ok: true });
}
