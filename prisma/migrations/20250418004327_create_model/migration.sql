/*
  Warnings:

  - The values [CURRENT,SAVINGS] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `accounts` table. All the data in the column will be lost.
  - Added the required column `city` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `town` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `RDO` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('INCORPORATION', 'PARTNERSHIP', 'COOPERATIVE', 'ASSOCIATION', 'CORPORATION', 'FREELANCE', 'PROFESSIONAL', 'SOLEPROPRIETORSHIP', 'OTHERS');
ALTER TABLE "accounts" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
COMMIT;

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "address",
DROP COLUMN "balance",
DROP COLUMN "isDefault",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "isIndividual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "town" TEXT NOT NULL,
ADD COLUMN     "zip" INTEGER NOT NULL,
DROP COLUMN "RDO",
ADD COLUMN     "RDO" INTEGER NOT NULL;
