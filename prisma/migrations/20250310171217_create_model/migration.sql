/*
  Warnings:

  - The `activityTotal` column on the `Cashflow` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Cashflow" DROP COLUMN "activityTotal",
ADD COLUMN     "activityTotal" DOUBLE PRECISION[];
