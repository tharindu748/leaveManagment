-- CreateEnum
CREATE TYPE "public"."HalfdayType" AS ENUM ('MORNING', 'AFTERNOON');

-- AlterTable
ALTER TABLE "public"."leave_request_dates" ADD COLUMN     "halfdayType" "public"."HalfdayType";
