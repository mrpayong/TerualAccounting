-- DropForeignKey
ALTER TABLE "archives" DROP CONSTRAINT "archives_accountId_fkey";

-- AlterTable
ALTER TABLE "archives" ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
