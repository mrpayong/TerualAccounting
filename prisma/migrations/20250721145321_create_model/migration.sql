-- DropForeignKey
ALTER TABLE "sub_account_transactions" DROP CONSTRAINT "sub_account_transactions_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_transactions" DROP CONSTRAINT "sub_account_transactions_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
