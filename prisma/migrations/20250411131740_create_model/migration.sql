/*
  Warnings:

  - You are about to drop the column `cashFlowId` on the `transactions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CashFlowPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEMI_ANNUAL', 'QUARTERLY', 'ANNUAL', 'FISCAL_YEAR');

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_cashFlowId_fkey";

-- AlterTable
ALTER TABLE "Cashflow" ADD COLUMN     "periodCashFlow" "CashFlowPeriod" NOT NULL DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "cashFlowId";

-- CreateTable
CREATE TABLE "cashflow_sub_accounts" (
    "cashFlowId" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "cashflow_sub_accounts_pkey" PRIMARY KEY ("cashFlowId","subAccountId")
);

-- CreateTable
CREATE TABLE "_TransactionToCashflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionToCashflow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TransactionToCashflow_B_index" ON "_TransactionToCashflow"("B");

-- CreateIndex
CREATE INDEX "sub_account_relations_parentId_idx" ON "sub_account_relations"("parentId");

-- CreateIndex
CREATE INDEX "sub_account_relations_childId_idx" ON "sub_account_relations"("childId");

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_cashFlowId_fkey" FOREIGN KEY ("cashFlowId") REFERENCES "Cashflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionToCashflow" ADD CONSTRAINT "_TransactionToCashflow_A_fkey" FOREIGN KEY ("A") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionToCashflow" ADD CONSTRAINT "_TransactionToCashflow_B_fkey" FOREIGN KEY ("B") REFERENCES "Cashflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
