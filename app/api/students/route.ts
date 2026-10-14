import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createStudent, listStudents } from "@/lib/data/students";
import { isSchoolGroup } from "@/lib/school/schedule";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const students = await listStudents();
  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!isSchoolGroup(body?.group)) {
    return NextResponse.json({ error: "Grupo inválido." }, { status: 400 });
  }
  const athleteId = typeof body?.athleteId === "string" && body.athleteId ? body.athleteId : null;

  let name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name && athleteId) {
    const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
    name = athlete?.name ?? "";
  }
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const student = await createStudent({
    name,
    group: body.group,
    school: typeof body?.school === "string" ? body.school : "",
    schoolYear: typeof body?.schoolYear === "string" ? body.schoolYear : "",
    className: typeof body?.className === "string" ? body.className : "",
    athleteId,
  });
  revalidatePath("/school", "layout");
  return NextResponse.json(student, { status: 201 });
}
