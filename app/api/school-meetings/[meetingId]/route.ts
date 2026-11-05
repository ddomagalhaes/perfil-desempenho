import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMeetingDetail, updateMeeting } from "@/lib/data/schoolMeetings";
import { parseDateOnly } from "@/lib/school/meetings";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;
  const meeting = await getMeetingDetail(meetingId);
  if (!meeting) return NextResponse.json({ error: "Reunião não encontrada." }, { status: 404 });
  return NextResponse.json(meeting);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;
  const body = await request.json().catch(() => null);

  let date: Date | undefined;
  if (typeof body?.date === "string") {
    const parsed = parseDateOnly(body.date);
    if (!parsed) return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    date = parsed;
  }

  let studentNotes: { studentId: string; note: string }[] | undefined;
  if (body && "studentNotes" in body) {
    const parsed = parseStudentNotes(body.studentNotes);
    if (!parsed) return NextResponse.json({ error: "Lista de notas inválida." }, { status: 400 });
    studentNotes = parsed;
  }

  const meeting = await updateMeeting(meetingId, {
    date,
    school: typeof body?.school === "string" ? body.school : undefined,
    withWhom: typeof body?.withWhom === "string" ? body.withWhom : undefined,
    note: typeof body?.note === "string" ? body.note : undefined,
    studentNotes,
  });
  revalidatePath("/school", "layout");
  return NextResponse.json(meeting);
}
