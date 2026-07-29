import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createProspect, listProspects, updateProspect, upsertScoutingNote } from "@/lib/data/prospects";
import { listPositions } from "@/lib/data/positions";
import { getActiveCompetencies } from "@/lib/data/competencies";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const [existingProspects, positions, kpis] = await Promise.all([
    listProspects(),
    listPositions(),
    getActiveCompetencies("SCOUTING"),
  ]);

  const prospectByName = new Map(existingProspects.map((p) => [p.name.toLowerCase(), p]));
  const positionByName = new Map(positions.map((p) => [p.name.toLowerCase(), p.id]));

  let created = 0;
  let updated = 0;
  let notesImported = 0;

  for (const row of sheetRows) {
    const name = String(row["Nome"] ?? "").trim();
    if (!name) continue;

    const positionName = String(row["Posição"] ?? "").trim();
    const positionId = positionName ? positionByName.get(positionName.toLowerCase()) ?? null : null;
    const club = String(row["Clube"] ?? "").trim() || null;

    const existing = prospectByName.get(name.toLowerCase());
    const prospect = existing
      ? await updateProspect(existing.id, { name, positionId, club })
      : await createProspect({ name, positionId, club });
    if (existing) updated++;
    else created++;

    for (const kpi of kpis) {
      const cell = row[kpi.name];
      if (cell === undefined) continue;
      const note = String(cell).trim();
      await upsertScoutingNote(prospect.id, kpi.id, note);
      if (note) notesImported++;
    }
  }

  revalidatePath("/scouting/prospects");
  revalidatePath("/scouting/compare");

  return NextResponse.json({ created, updated, notesImported });
}
