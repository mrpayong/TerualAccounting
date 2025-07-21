/*
  Warnings:

  - You are about to drop the column `cashFlowId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_cashFlowId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "cashFlowId";

-- CreateTable
CREATE TABLE "sub_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "accountId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TransactionTocashFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionTocashFlow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SubAccountToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubAccountToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "sub_accounts_accountId_idx" ON "sub_accounts"("accountId");

-- CreateIndex
CREATE INDEX "sub_accounts_parentId_idx" ON "sub_accounts"("parentId");

-- CreateIndex
CREATE INDEX "_TransactionTocashFlow_B_index" ON "_TransactionTocashFlow"("B");

-- CreateIndex
CREATE INDEX "_SubAccountToTransaction_B_index" ON "_SubAccountToTransaction"("B");

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionTocashFlow" ADD CONSTRAINT "_TransactionTocashFlow_A_fkey" FOREIGN KEY ("A") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionTocashFlow" ADD CONSTRAINT "_TransactionTocashFlow_B_fkey" FOREIGN KEY ("B") REFERENCES "Cashflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubAccountToTransaction" ADD CONSTRAINT "_SubAccountToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubAccountToTransaction" ADD CONSTRAINT "_SubAccountToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
