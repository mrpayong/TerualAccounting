/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `RDO` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDate` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessLine` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tin` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccountType" ADD VALUE 'SOLEPROPRIETORSHIP';
ALTER TYPE "AccountType" ADD VALUE 'PARTNERSHIP';
ALTER TYPE "AccountType" ADD VALUE 'CORPORATION';
ALTER TYPE "AccountType" ADD VALUE 'OTHERS';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "RDO" TEXT NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "branchCount" INTEGER,
ADD COLUMN     "businessLine" TEXT NOT NULL,
ADD COLUMN     "contactNumber" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "tin" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
