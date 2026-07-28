import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getActiveCompetencies, replaceCompetencies } from "@/lib/data/competencies";

export async function GET() {
  const competencies = await getActiveCompetencies();
  return NextResponse.json(competencies);
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const names = Array.isArray(body?.names)
    ? body.names.filter((n: unknown): n is string => typeof n === "string")
    : null;

  if (!names || names.length === 0) {
    return NextResponse.json(
      { error: "names deve ser uma lista não vazia de strings." },
      { status: 400 }
    );
  }

  const competencies = await replaceCompetencies(names);

  revalidatePath("/competencies");
  revalidatePath("/compare");

  return NextResponse.json(competencies);
}
