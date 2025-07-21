-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_childId_fkey";

-- DropForeignKey
ALTER TABLE "sub_account_relations" DROP CONSTRAINT "sub_account_relations_parentId_fkey";

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
