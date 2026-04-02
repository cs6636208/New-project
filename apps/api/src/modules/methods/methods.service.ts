import { prisma } from "../../lib/prisma.js";

const defaultMethods = [
  {
    key: "bisection",
    title: "Bisection Method",
    description: "Root finding with interval halving and convergence tracking.",
    defaultEquation: "x^4 - 13"
  },
  {
    key: "false-position",
    title: "False Position Method",
    description: "Root finding with linear interpolation inside the initial bracket.",
    defaultEquation: "x^3 - x - 2"
  }
];

export async function ensureMethodsSeeded() {
  const totalMethods = await prisma.method.count();

  if (totalMethods > 0) {
    return;
  }

  await prisma.method.createMany({
    data: defaultMethods
  });
}

export async function listMethods() {
  return prisma.method.findMany({
    orderBy: {
      createdAt: "asc"
    }
  });
}

