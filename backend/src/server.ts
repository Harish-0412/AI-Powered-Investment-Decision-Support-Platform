import { env } from "./config/env";
import { app } from "./app";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`Backend API listening on port ${env.PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
