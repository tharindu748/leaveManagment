/*
  Warnings:

  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registered_users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[employee_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance_day" DROP CONSTRAINT "attendance_day_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."punches" DROP CONSTRAINT "punches_employee_id_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "NIC" TEXT,
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "card_number" TEXT,
ADD COLUMN     "employee_id" TEXT,
ADD COLUMN     "epfNo" TEXT,
ADD COLUMN     "jobPosition" TEXT,
ADD COLUMN     "valid_from" TIMESTAMP(3),
ADD COLUMN     "valid_to" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."employees";

-- DropTable
DROP TABLE "public"."registered_users";

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "public"."users"("employee_id");

-- AddForeignKey
ALTER TABLE "public"."punches" ADD CONSTRAINT "punches_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_day" ADD CONSTRAINT "attendance_day_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;
