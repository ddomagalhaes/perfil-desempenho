import "dotenv/config";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_COMPETENCIES = [
  {
    name: "Confiança",
    description:
      "Grau de confiança que o atleta tem nas suas capacidades para competir e responder a desafios com sucesso.",
  },
  {
    name: "Concentração",
    description:
      "Capacidade de manter o foco na tarefa e nos estímulos relevantes, sem se deixar distrair durante o desempenho.",
  },
  {
    name: "Motivação",
    description:
      "Nível de empenho e vontade de treinar e competir, incluindo a persistência para atingir objetivos.",
  },
  {
    name: "Controlo Emocional",
    description:
      "Capacidade de reconhecer e gerir emoções (frustração, raiva, ansiedade) sem que prejudiquem o desempenho.",
  },
  {
    name: "Gestão da Pressão",
    description:
      "Capacidade de manter o desempenho e a tomada de decisão em momentos de elevada exigência ou stress competitivo.",
  },
  {
    name: "Comunicação",
    description:
      "Eficácia a transmitir e receber informação com colegas de equipa e treinador, dentro e fora do campo.",
  },
  {
    name: "Resiliência",
    description:
      "Capacidade de recuperar de erros, derrotas ou adversidade, mantendo uma atitude construtiva.",
  },
];

async function main() {
  const existing = await prisma.competency.count({ where: { archivedAt: null } });
  if (existing > 0) {
    console.log(`Já existem ${existing} competências ativas — seed ignorado.`);
    return;
  }

  await prisma.competency.createMany({
    data: DEFAULT_COMPETENCIES.map((c, index) => ({
      name: c.name,
      description: c.description,
      position: index,
    })),
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
