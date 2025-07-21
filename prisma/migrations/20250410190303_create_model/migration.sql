-- AlterTable
ALTER TABLE "sub_account_relations" ALTER COLUMN "relationName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sub_accounts" ALTER COLUMN "balance" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;
