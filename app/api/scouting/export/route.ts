import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getProspectDetail, listProspects } from "@/lib/data/prospects";
import { getActiveCompetencies } from "@/lib/data/competencies";

export async function GET() {
  const [prospects, kpis] = await Promise.all([
    listProspects(),
    getActiveCompetencies("SCOUTING"),
  ]);

  const details = await Promise.all(prospects.map((p) => getProspectDetail(p.id)));

  const rows = details.map((detail, i) => {
    const p = prospects[i];
    const row: Record<string, string> = {
      Nome: p.name,
      Posição: p.positionName ?? "",
      Clube: p.club ?? "",
    };
    for (const kpi of kpis) {
      row[kpi.name] = detail?.notes[kpi.id] ?? "";
    }
    return row;
  });

  const headers = ["Nome", "Posição", "Clube", ...kpis.map((k) => k.name)];
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Scouting");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Blob([Uint8Array.from(buffer)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="scouting.xlsx"',
    },
  });
}
