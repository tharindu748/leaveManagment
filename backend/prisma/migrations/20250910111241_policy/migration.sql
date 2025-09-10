-- CreateTable
CREATE TABLE "public"."leave_policies" (
    "leaveType" "public"."LeaveType" NOT NULL,
    "defaultBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("leaveType")
);
