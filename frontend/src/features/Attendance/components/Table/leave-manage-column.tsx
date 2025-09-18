import { type ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router";

export type LeaveRequest = {
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  leaveType: string;
  reason: string;
  status: string;
  dates: {
    id: number;
    requestId: number;
    leaveDate: string;
    isHalfDay: boolean;
    halfdayType: string | null;
  }[];
  requestedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
};

export const leaveManageColumns: ColumnDef<LeaveRequest>[] = [
  {
    accessorFn: (row) => row.user?.name,
    id: "name",
    header: "Employee Name",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.user?.email,
    id: "email",
    header: "Email",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.dates.map((d) => d.leaveDate).join(", "),
    id: "leaveDates",
    header: "Leave Dates",
    cell: ({ getValue }) => {
      const dates = (getValue<string>() || "").split(", ");
      return (
        <div className="flex flex-col gap-1">
          {dates.map((date, i) => (
            <span key={i}>{new Date(date).toLocaleDateString()}</span>
          ))}
        </div>
      );
    },
  },
  {
    accessorFn: (row) =>
      row.dates.some((d) => d.isHalfDay)
        ? "Half Day (" +
          row.dates
            .filter((d) => d.isHalfDay)
            .map((d) => d.halfdayType)
            .join(", ") +
          ")"
        : "Full Day",
    id: "dayType",
    header: "Half/Full Day",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorKey: "leaveType",
    header: "Leave Type",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.requestedAt,
    id: "requestedAt",
    header: "Requested At",
    cell: ({ getValue }) => (
      <div>{new Date(getValue<string>()).toLocaleString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 float-right">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="default">Approve</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Reject</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
