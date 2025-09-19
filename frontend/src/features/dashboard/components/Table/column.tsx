import { type ColumnDef } from "@tanstack/react-table";

export type LeaveRequest = {
  name: string;
  late: number;
  workingDays: number;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    accessorFn: (row) => row.name,
    id: "name",
    header: "Name",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.late,
    id: "late",
    header: "Late",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.workingDays,
    id: "workingDays",
    header: "Working Days",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
];
