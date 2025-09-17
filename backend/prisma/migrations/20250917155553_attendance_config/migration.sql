-- CreateTable
CREATE TABLE "public"."attendance_config" (
    "id" SERIAL NOT NULL,
    "workStart" TIMESTAMP(3) NOT NULL,
    "workEnd" TIMESTAMP(3) NOT NULL,
    "otEnd" TIMESTAMP(3) NOT NULL,
    "earlyStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_config_pkey" PRIMARY KEY ("id")
);
