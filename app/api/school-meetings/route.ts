import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createMeeting, listMeetings } from "@/lib/data/schoolMeetings";
import { isSchoolGroup } from "@/lib/school/schedule";
import { parseDateOnly } from "@/lib/school/meetings";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const groupParam = params.get("group");
  const studentQuery = params.get("studentQuery")?.trim() || undefined;
  const fromParam = params.get("from");
  const toParam = params.get("to");

  const meetings = await listMeetings({
    group: groupParam && isSchoolGroup(groupParam) ? groupParam : undefined,
    studentQuery,
    from: fromParam ? (parseDateOnly(fromParam) ?? undefined) : undefined,
    to: toParam ? (parseDateOnly(toParam) ?? undefined) : undefined,
  });
  return NextResponse.json(meetings);
}

function parseStudentNotes(value: unknown): { studentId: string; note: string }[] | null {
  if (!Array.isArray(value)) return null;
  const notes: { studentId: string; note: string }[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const { studentId, note } = entry as Record<string, unknown>;
    if (typeof studentId !== "string" || !studentId) return null;
    if (typeof note !== "string") return null;
    notes.push({ studentId, note });
  }
  return notes;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!isSchoolGroup(body?.group)) {
    return NextResponse.json({ error: "Grupo inválido." }, { status: 400 });
  }
  const date = typeof body?.date === "string" ? parseDateOnly(body.date) : null;
  if (!date) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }
  const studentNotes = parseStudentNotes(body?.studentNotes ?? []);
  if (!studentNotes) {
    return NextResponse.json({ error: "Lista de notas inválida." }, { status: 400 });
  }

  const meeting = await createMeeting({
    date,
    group: body.group,
    school: typeof body?.school === "string" ? body.school : "",
    withWhom: typeof body?.withWhom === "string" ? body.withWhom : "",
    note: typeof body?.note === "string" ? body.note : "",
    studentNotes,
  });
  revalidatePath("/school", "layout");
  return NextResponse.json(meeting, { status: 201 });
}
