import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const localUrl =
  env.LOCAL_DATABASE_URL ||
  "postgresql://postgres:hello@localhost:5432/investment_intelligence";

let localPrisma: PrismaClient | null = null;

export const getLocalPrisma = (): PrismaClient | null => {
  if (localPrisma && typeof localPrisma.userProfile?.findUnique === "function") {
    return localPrisma;
  }

  if (localPrisma) {
    void localPrisma.$disconnect();
    localPrisma = null;
  }

  try {
    const adapter = new PrismaPg({ connectionString: localUrl });
    const client = new PrismaClient({ adapter });

    if (typeof client.userProfile?.findUnique !== "function") {
      return null;
    }

    localPrisma = client;
    return localPrisma;
  } catch {
    return null;
  }
};

export const disconnectLocalPrisma = async () => {
  if (localPrisma) {
    await localPrisma.$disconnect();
    localPrisma = null;
  }
};
