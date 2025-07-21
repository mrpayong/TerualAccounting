-- DropForeignKey
ALTER TABLE "Cashflow" DROP CONSTRAINT "Cashflow_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Cashflow" DROP CONSTRAINT "Cashflow_userId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "cashflow_sub_accounts" DROP CONSTRAINT "cashflow_sub_accounts_cashFlowId_fkey";

-- DropForeignKey
ALTER TABLE "cashflow_sub_accounts" DROP CONSTRAINT "cashflow_sub_accounts_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_childId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_parentId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_transactions" DROP CONSTRAINT "sub_account_transactions_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_transactions" DROP CONSTRAINT "sub_account_transactions_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "sub_accounts" DROP CONSTRAINT "sub_accounts_accountId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_accountId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashflow" ADD CONSTRAINT "Cashflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashflow" ADD CONSTRAINT "Cashflow_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sub_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "sub_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_cashFlowId_fkey" FOREIGN KEY ("cashFlowId") REFERENCES "Cashflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
