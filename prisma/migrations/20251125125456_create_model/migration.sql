-- CreateTable
CREATE TABLE "predicted_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "monthYear" TIMESTAMP(3),
    "inflow" DOUBLE PRECISION NOT NULL,
    "outflow" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predicted_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "predicted_data_userId_idx" ON "predicted_data"("userId");

-- CreateIndex
CREATE INDEX "predicted_data_accountId_idx" ON "predicted_data"("accountId");

-- AddForeignKey
ALTER TABLE "predicted_data" ADD CONSTRAINT "predicted_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicted_data" ADD CONSTRAINT "predicted_data_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
