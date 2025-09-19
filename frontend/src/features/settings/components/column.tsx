import { type ColumnDef } from "@tanstack/react-table";

export type LeavePolicy = {
  leaveType: string;
  defaultBalance: string;
};

export const columns: ColumnDef<LeavePolicy>[] = [
  {
    accessorFn: (row) => row.leaveType,
    id: "leaveType",
    header: "Leave Type",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.defaultBalance,
    id: "defaultBalance",
    header: "Default Balance",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
];
