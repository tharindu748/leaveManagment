import { type ColumnDef } from "@tanstack/react-table";

export type LeaveRequest = {
  id: number;
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
  approvedBy: number;
  rejectedAt?: string | null;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    accessorFn: (row) => row.user?.name,
    id: "name",
    header: "Name",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.user?.email,
    id: "Late",
    header: "Late",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.user?.email,
    id: "Working Days",
    header: "Working Days",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
];
