import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getActiveCompetencies, replaceCompetencies } from "@/lib/data/competencies";
import { areaTypeFromSlug, isAreaSlug } from "@/lib/areas";
import type { CompetencyInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const areaParam = request.nextUrl.searchParams.get("area") ?? "psychological";
  if (!isAreaSlug(areaParam)) {
    return NextResponse.json({ error: "area inválida." }, { status: 400 });
  }

  const competencies = await getActiveCompetencies(areaTypeFromSlug(areaParam));
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
  const areaParam = typeof body?.area === "string" ? body.area : "psychological";
  const items = Array.isArray(body?.competencies)
    ? body.competencies.filter(isCompetencyInput)
    : null;
  const names = items?.map((i: CompetencyInput) => i.name.trim()).filter(Boolean);

  if (!isAreaSlug(areaParam) || !items || !names || names.length === 0) {
    return NextResponse.json(
      {
        error:
          "area válida e competencies (lista não vazia de { name, description }) são obrigatórios.",
      },
      { status: 400 }
    );
  }

  const competencies = await replaceCompetencies(areaTypeFromSlug(areaParam), items);

  revalidatePath(`/${areaParam}/competencies`);
  revalidatePath(`/${areaParam}/legend`);
  revalidatePath(`/${areaParam}/compare`);

  return NextResponse.json(competencies);
}
