/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `sub_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_id_key" ON "sub_accounts"("id");
