/*
  Warnings:

  - You are about to drop the `_SubAccountToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SubAccountToTransaction" DROP CONSTRAINT "_SubAccountToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubAccountToTransaction" DROP CONSTRAINT "_SubAccountToTransaction_B_fkey";

-- DropTable
DROP TABLE "_SubAccountToTransaction";

-- CreateTable
CREATE TABLE "sub_account_transactions" (
    "subAccountId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_account_transactions_pkey" PRIMARY KEY ("subAccountId","transactionId")
);

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
