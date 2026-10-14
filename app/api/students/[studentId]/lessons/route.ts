import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setLesson } from "@/lib/data/students";
import { isWeekday } from "@/lib/school/schedule";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.slotId !== "string" || !isWeekday(body?.weekday)) {
    return NextResponse.json({ error: "Bloco ou dia inválido." }, { status: 400 });
  }

  const ok = await setLesson(studentId, body.slotId, body.weekday, {
    subject: typeof body.subject === "string" ? body.subject : "",
    room: typeof body.room === "string" ? body.room : "",
    teacher: typeof body.teacher === "string" ? body.teacher : "",
  });
  if (!ok) return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });

  revalidatePath("/school", "layout");
  return NextResponse.json({ ok: true });
}
