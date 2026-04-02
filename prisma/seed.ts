import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.method.upsert({
    where: { key: "bisection" },
    update: {},
    create: {
      key: "bisection",
      title: "Bisection Method",
      description: "Root finding with interval halving and convergence tracking.",
      defaultEquation: "x^4 - 13"
    }
  });

  await prisma.method.upsert({
    where: { key: "false-position" },
    update: {},
    create: {
      key: "false-position",
      title: "False Position Method",
      description: "Root finding with linear interpolation inside the initial bracket.",
      defaultEquation: "x^3 - x - 2"
    }
  });
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

