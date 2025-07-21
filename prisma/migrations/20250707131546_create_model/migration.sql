-- CreateTable
CREATE TABLE "archives" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "archives_userId_idx" ON "archives"("userId");

-- CreateIndex
CREATE INDEX "archives_accountId_idx" ON "archives"("accountId");

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
