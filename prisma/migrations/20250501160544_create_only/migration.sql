/*
  Warnings:

  - Added the required column `printNumber` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "printNumber" TEXT NOT NULL;
