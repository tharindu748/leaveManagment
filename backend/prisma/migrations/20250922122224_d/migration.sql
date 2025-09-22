/*
  Warnings:

  - You are about to drop the `device_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."device_config";

-- CreateTable
CREATE TABLE "public"."device_configs" (
    "id" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordEnc" TEXT NOT NULL,
    "lastEventTime" TEXT,
    "authFailedAt" TIMESTAMP(3),
    "authFailureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_configs_pkey" PRIMARY KEY ("id")
);
