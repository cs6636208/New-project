import { prisma } from "../../lib/prisma.js";
import { methodCatalog } from "./method-catalog.js";

export async function ensureMethodsSeeded() {
  await Promise.all(
    methodCatalog.map((method) =>
      prisma.method.upsert({
        where: {
          key: method.key
        },
        update: method,
        create: method
      })
    )
  );
}

export async function listMethods() {
  const methods = (await prisma.method.findMany({
    orderBy: {
      createdAt: "asc"
    }
  })) as Array<
    (typeof methodCatalog)[number] & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
    }
  >;

  return methods.sort((left, right) => {
    if (left.categoryOrder !== right.categoryOrder) {
      return left.categoryOrder - right.categoryOrder;
    }

    return left.orderIndex - right.orderIndex;
  });
}
