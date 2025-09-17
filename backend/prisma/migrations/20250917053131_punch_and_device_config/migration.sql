-- AlterTable
ALTER TABLE "public"."punches" ADD COLUMN     "correct_event_time" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."device_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "ip" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_enc" TEXT NOT NULL,
    "last_event_time" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "punches_employee_id_correct_event_time_idx" ON "public"."punches"("employee_id", "correct_event_time");
