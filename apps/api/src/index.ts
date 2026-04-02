import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { ensureMethodsSeeded } from "./modules/methods/methods.service.js";

async function bootstrap() {
  await prisma.$connect();
  await ensureMethodsSeeded();

  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("Failed to start API", error);
  await prisma.$disconnect();
  process.exit(1);
});
