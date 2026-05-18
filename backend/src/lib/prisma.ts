import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  const client = new PrismaClient({ adapter });

  if (typeof client.userProfile?.findUnique !== "function") {
    throw new Error(
      "Prisma Client is missing UserProfile. Run `npm run prisma:generate` in backend, then restart the server."
    );
  }

  return client;
};

const getPrismaClient = (): PrismaClient => {
  const cached = globalForPrisma.prisma;

  if (cached && typeof cached.userProfile?.findUnique === "function") {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
};

export const getPrisma = getPrismaClient;

/** Prefer `getPrisma()` in services to avoid stale delegates after `prisma generate`. */
export const prisma = getPrismaClient();
