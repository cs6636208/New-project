-- CreateTable
CREATE TABLE "Method" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultEquation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputationRun" (
    "id" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "equation" TEXT NOT NULL,
    "xl" DOUBLE PRECISION NOT NULL,
    "xr" DOUBLE PRECISION NOT NULL,
    "root" DOUBLE PRECISION NOT NULL,
    "epsilon" DOUBLE PRECISION NOT NULL,
    "maxIterations" INTEGER NOT NULL,
    "converged" BOOLEAN NOT NULL,
    "iterations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComputationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Method_key_key" ON "Method"("key");

-- CreateIndex
CREATE INDEX "ComputationRun_methodId_createdAt_idx" ON "ComputationRun"("methodId", "createdAt");

-- AddForeignKey
ALTER TABLE "ComputationRun" ADD CONSTRAINT "ComputationRun_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method"("id") ON DELETE CASCADE ON UPDATE CASCADE;
