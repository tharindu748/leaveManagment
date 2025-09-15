import { type ColumnDef } from "@tanstack/react-table";

export type Employee = {
  Date: string;
  StartTime: string;
  LastOut: string;
  WorkHours: string;
  NotWorkHours: string;
  OverTime: string;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee Id",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("employeeId") as string}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("name") as string}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("email") as string}
      </div>
    ),
  },
  {
    accessorKey: "efpNo",
    header: "EPF No",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("efpNo") as string}
      </div>
    ),
  },
  {
    accessorKey: "nic",
    header: "NIC",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("nic") as string}
      </div>
    ),
  },
  {
    accessorKey: "jobPosition",
    header: "Job Position",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("jobPosition") as string}
      </div>
    ),
  },
];
