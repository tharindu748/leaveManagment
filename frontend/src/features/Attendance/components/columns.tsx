import { type ColumnDef } from "@tanstack/react-table";

export type Punches = {
  Date: string;
  StartTime: string;
  LastOut: string;
  WorkHours: string;
  NotWorkHours: string;
  OverTime: string;
};

export const columns: ColumnDef<Punches>[] = [
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
    accessorKey: "firstIn",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("firstIn") as string}
      </div>
    ),
  },
  {
    accessorKey: "eventTime",
    header: "Date/Time",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("eventTime") as string}
      </div>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("direction") as string}
      </div>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("source") as string}
      </div>
    ),
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("note") as string}
      </div>
    ),
  },
];
