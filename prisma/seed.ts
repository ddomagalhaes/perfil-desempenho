import "dotenv/config";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_COMPETENCIES = [
  "Confiança",
  "Concentração",
  "Motivação",
  "Controlo Emocional",
  "Gestão da Pressão",
  "Comunicação",
  "Resiliência",
];

async function main() {
  const existing = await prisma.competency.count({ where: { archivedAt: null } });
  if (existing > 0) {
    console.log(`Já existem ${existing} competências ativas — seed ignorado.`);
    return;
  }

  await prisma.competency.createMany({
    data: DEFAULT_COMPETENCIES.map((name, index) => ({ name, position: index })),
  });

  console.log(`Criadas ${DEFAULT_COMPETENCIES.length} competências por omissão.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
