-- CreateEnum
CREATE TYPE "public"."Direction" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "public"."Source" AS ENUM ('device', 'manual');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('OK', 'ABSENT', 'PARTIAL', 'MANUAL');

-- CreateTable
CREATE TABLE "public"."registered_users" (
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "card_number" TEXT,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "epfNo" TEXT,
    "NIC" TEXT,
    "jobPosition" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registered_users_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "public"."sync_history" (
    "id" SERIAL NOT NULL,
    "sync_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_users" INTEGER NOT NULL,
    "new_users" INTEGER NOT NULL,
    "updated_users" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "public"."punches" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "event_time" TIMESTAMP(3) NOT NULL,
    "direction" "public"."Direction" NOT NULL,
    "source" "public"."Source" NOT NULL,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direction_corrected" BOOLEAN NOT NULL DEFAULT false,
    "original_direction" "public"."Direction",
    "corrected_by" TEXT,
    "correction_note" TEXT,
    "corrected_at" TIMESTAMP(3),

    CONSTRAINT "punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_day" (
    "employee_id" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "first_in" TEXT,
    "last_out" TEXT,
    "worked_seconds" INTEGER NOT NULL DEFAULT 0,
    "not_working_seconds" INTEGER NOT NULL DEFAULT 0,
    "overtime_seconds" INTEGER NOT NULL DEFAULT 0,
    "had_manual" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'OK',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_day_pkey" PRIMARY KEY ("employee_id","work_date")
);

-- CreateIndex
CREATE INDEX "punches_employee_id_event_time_idx" ON "public"."punches"("employee_id", "event_time");

-- CreateIndex
CREATE UNIQUE INDEX "punches_employee_id_event_time_direction_source_key" ON "public"."punches"("employee_id", "event_time", "direction", "source");

-- CreateIndex
CREATE INDEX "attendance_day_work_date_idx" ON "public"."attendance_day"("work_date");

-- AddForeignKey
ALTER TABLE "public"."punches" ADD CONSTRAINT "punches_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_day" ADD CONSTRAINT "attendance_day_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;
