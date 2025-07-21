/*
  Warnings:

  - You are about to drop the column `status` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `budgets` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('COMPLETED', 'PROGRESS', 'PLANNING', 'RESEARCH');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_userId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "status";

-- DropTable
DROP TABLE "budgets";

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskDescription" TEXT,
    "taskCategory" TEXT NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
