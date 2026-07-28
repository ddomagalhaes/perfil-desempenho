import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getActiveCompetencies, replaceCompetencies } from "@/lib/data/competencies";
import type { CompetencyInput } from "@/lib/types";

export async function GET() {
  const competencies = await getActiveCompetencies();
  return NextResponse.json(competencies);
}

function isCompetencyInput(item: unknown): item is CompetencyInput {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as CompetencyInput).name === "string" &&
    typeof (item as CompetencyInput).description === "string"
  );
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.competencies)
    ? body.competencies.filter(isCompetencyInput)
    : null;
  const names = items?.map((i: CompetencyInput) => i.name.trim()).filter(Boolean);

  if (!items || !names || names.length === 0) {
    return NextResponse.json(
      {
        error:
          "competencies deve ser uma lista não vazia de { name, description }.",
      },
      { status: 400 }
    );
  }

  const competencies = await replaceCompetencies(items);

  revalidatePath("/competencies");
  revalidatePath("/legend");
  revalidatePath("/compare");

  return NextResponse.json(competencies);
}
