ALTER TABLE "Method"
ADD COLUMN "categoryKey" TEXT NOT NULL DEFAULT 'root-of-equation',
ADD COLUMN "categoryLabel" TEXT NOT NULL DEFAULT 'Root Of Equation',
ADD COLUMN "categoryOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "equationLabel" TEXT NOT NULL DEFAULT 'Equation f(x)',
ADD COLUMN "primaryInputLabel" TEXT NOT NULL DEFAULT 'Primary Input',
ADD COLUMN "secondaryInputLabel" TEXT,
ADD COLUMN "secondaryInputNeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "defaultPrimaryInput" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "defaultSecondaryInput" DOUBLE PRECISION;

CREATE INDEX "Method_categoryOrder_orderIndex_idx" ON "Method"("categoryOrder", "orderIndex");
