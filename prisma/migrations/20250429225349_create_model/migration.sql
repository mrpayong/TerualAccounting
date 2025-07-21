/*
  Warnings:

  - You are about to drop the column `buidlingNumber` on the `accounts` table. All the data in the column will be lost.
  - Added the required column `buildingNumber` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "buidlingNumber",
ADD COLUMN     "buildingNumber" TEXT NOT NULL;
