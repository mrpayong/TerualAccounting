/*
  Warnings:

  - You are about to drop the column `parentId` on the `sub_accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sub_accounts" DROP CONSTRAINT "sub_accounts_parentId_fkey";

-- DropIndex
DROP INDEX "sub_accounts_parentId_idx";

-- AlterTable
ALTER TABLE "sub_accounts" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "sub_account_relations" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "childId" TEXT NOT NULL,
    "relationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "sub_account_relations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sub_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_relations" ADD CONSTRAINT "sub_account_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "sub_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
