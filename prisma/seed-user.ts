import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

async function main() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  const name = process.env.SEED_NAME;

  if (!email || !password || !name) {
    throw new Error("Define SEED_EMAIL, SEED_PASSWORD e SEED_NAME.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log("Seeded user:", user.email, user.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
