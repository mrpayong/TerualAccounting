-- DropForeignKey
ALTER TABLE "cashflow_sub_accounts" DROP CONSTRAINT "cashflow_sub_accounts_cashFlowId_fkey";

-- DropForeignKey
ALTER TABLE "cashflow_sub_accounts" DROP CONSTRAINT "cashflow_sub_accounts_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_childId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_parentId_fkey";

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_cashFlowId_fkey" FOREIGN KEY ("cashFlowId") REFERENCES "Cashflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashflow_sub_accounts" ADD CONSTRAINT "cashflow_sub_accounts_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
