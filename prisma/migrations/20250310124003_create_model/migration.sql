/*
  Warnings:

  - You are about to alter the column `activityTotal` on the `Cashflow` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `netChange` on the `Cashflow` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `startBalance` on the `Cashflow` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `endBalance` on the `Cashflow` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Cashflow" ALTER COLUMN "activityTotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "netChange" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "startBalance" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "endBalance" SET DATA TYPE DOUBLE PRECISION;
