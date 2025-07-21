/*
  Warnings:

  - You are about to drop the `_TransactionTocashFlow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TransactionTocashFlow" DROP CONSTRAINT "_TransactionTocashFlow_A_fkey";

-- DropForeignKey
ALTER TABLE "_TransactionTocashFlow" DROP CONSTRAINT "_TransactionTocashFlow_B_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "cashFlowId" TEXT;

-- DropTable
DROP TABLE "_TransactionTocashFlow";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cashFlowId_fkey" FOREIGN KEY ("cashFlowId") REFERENCES "Cashflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
