import { PrismaClient } from "@prisma/client";
import { methodCatalog } from "../apps/api/src/modules/methods/method-catalog.js";

const prisma = new PrismaClient();

async function main() {
  for (const method of methodCatalog) {
    await prisma.method.upsert({
      where: { key: method.key },
      update: method,
      create: method
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
