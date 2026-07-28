import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPositionCompetencies, replacePositionCompetencies } from "@/lib/data/positions";
import type { CompetencyInput } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;
  const competencies = await getPositionCompetencies(positionId);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.competencies)
    ? body.competencies.filter(isCompetencyInput)
    : null;

  if (!items) {
    return NextResponse.json(
      { error: "competencies deve ser uma lista de { name, description }." },
      { status: 400 }
    );
  }

  const competencies = await replacePositionCompetencies(positionId, items);

  revalidatePath("/technical/competencies");
  revalidatePath("/technical/legend");
  revalidatePath("/technical/compare");
  return NextResponse.json(competencies);
}
