import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { parseRespostasFormulario, manterRespostasMaisRecentes, POSICAO_NOME_PT } from "@/lib/tecnico-tatica/parser";
import { createAthlete, setAthletePosition } from "@/lib/data/athletes";
import { getPositionCompetencies, listPositions } from "@/lib/data/positions";
import { upsertScore } from "@/lib/data/scores";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const teamId = form?.get("teamId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
  }
  if (typeof teamId !== "string" || !teamId) {
    return NextResponse.json({ error: "Equipa de destino em falta." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

  let parseResult;
  try {
    parseResult = parseRespostasFormulario(linhas);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const respostas = manterRespostasMaisRecentes(parseResult.respostas);
  const ignoradas = [...parseResult.ignoradas];

  const positions = await listPositions();
  const positionByName = new Map(positions.map((p) => [p.name.toLowerCase(), p]));
  const competenciesCache = new Map<string, Awaited<ReturnType<typeof getPositionCompetencies>>>();

  let criados = 0;

  for (const resposta of respostas) {
    const positionName = POSICAO_NOME_PT[resposta.posicaoCodigo];
    const position = positionByName.get(positionName.toLowerCase());
    if (!position) {
      ignoradas.push({
        linha: 0,
        nome: resposta.nome,
        motivo: `posição "${positionName}" não está configurada em Técnico/Tático`,
      });
      continue;
    }

    if (!competenciesCache.has(position.id)) {
      competenciesCache.set(position.id, await getPositionCompetencies(position.id));
    }
    const competencies = competenciesCache.get(position.id)!;

    const athlete = await createAthlete(teamId, resposta.nome);
    await setAthletePosition(athlete.id, position.id);

    const count = Math.min(competencies.length, resposta.valores.length);
    for (let i = 0; i < count; i++) {
      await upsertScore(athlete.id, competencies[i].id, resposta.valores[i]);
    }

    criados++;
  }

  revalidatePath("/technical/teams");
  revalidatePath("/scouting/prospects");

  return NextResponse.json({ criados, ignorados: ignoradas });
}
