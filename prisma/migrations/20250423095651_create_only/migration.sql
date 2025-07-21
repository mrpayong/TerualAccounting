/*
  Warnings:

  - A unique constraint covering the columns `[refNumber]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refNumber` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "refNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_refNumber_key" ON "transactions"("refNumber");
