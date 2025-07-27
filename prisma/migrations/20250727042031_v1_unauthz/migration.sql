-- CreateTable
CREATE TABLE "Unauthz" (
    "id" TEXT NOT NULL,
    "IP" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unauthz_pkey" PRIMARY KEY ("id")
);
