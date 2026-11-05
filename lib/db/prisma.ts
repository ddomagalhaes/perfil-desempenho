import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // O "prisma dev" local (Postgres embutido) não aguenta mais do que uma
    // ligação em simultâneo — duas queries em paralelo (Promise.all) rebentam
    // com "Connection terminated unexpectedly". A Neon de produção não tem
    // este limite, por isso só reduz o pool fora de produção.
    ...(process.env.NODE_ENV !== "production" ? { max: 1 } : {}),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
