import { type ColumnDef } from "@tanstack/react-table";

export type Punches = {
  Date: string;
  StartTime: string;
  LastOut: string;
  WorkHours: string;
  NotWorkHours: string;
  OverTime: string;
  user: {
    name: string;
  };
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
    accessorFn: (row) => row.user?.name,
    id: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">{getValue() as string}</div>
    ),
  },
  {
    accessorKey: "eventTime",
    header: "Date/Time",
    cell: ({ row }) => {
      const raw = row.getValue("eventTime") as string;
      return (
        <div className="flex flex-wrap gap-1">
          {new Date(raw).toLocaleString()}
        </div>
      );
    },
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
