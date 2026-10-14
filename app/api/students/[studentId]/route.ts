import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { archiveStudent, updateStudent } from "@/lib/data/students";
import { isSchoolGroup } from "@/lib/school/schedule";

function optionalString(body: Record<string, unknown> | null, key: string): string | undefined {
  const value = body?.[key];
  return typeof value === "string" ? value : undefined;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const body = await request.json().catch(() => null);

  const name = optionalString(body, "name");
  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const student = await updateStudent(studentId, {
    name,
    group: isSchoolGroup(body?.group) ? body.group : undefined,
    school: optionalString(body, "school"),
    schoolYear: optionalString(body, "schoolYear"),
    className: optionalString(body, "className"),
    includeSaturday:
      typeof body?.includeSaturday === "boolean" ? body.includeSaturday : undefined,
    athleteId:
      body && "athleteId" in body
        ? typeof body.athleteId === "string" && body.athleteId
          ? body.athleteId
          : null
        : undefined,
  });

  revalidatePath("/school", "layout");
  return NextResponse.json(student);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  await archiveStudent(studentId);
  revalidatePath("/school", "layout");
  return NextResponse.json({ ok: true });
}
