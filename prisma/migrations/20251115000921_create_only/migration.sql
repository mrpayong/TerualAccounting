-- AlterTable
ALTER TABLE "Cashflow" ADD COLUMN     "voided" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "voided" BOOLEAN NOT NULL DEFAULT false;
