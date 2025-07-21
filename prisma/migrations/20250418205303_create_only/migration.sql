/*
  Warnings:

  - The `tin` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "accounts_email_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "tin",
ADD COLUMN     "tin" INTEGER[],
ALTER COLUMN "RDO" SET DATA TYPE TEXT;
