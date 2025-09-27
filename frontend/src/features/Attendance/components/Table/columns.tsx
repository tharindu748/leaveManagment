import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type Punches = {
  id: number;
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

export const columns = (
  handleDelete: (id: number) => void
): ColumnDef<Punches>[] => [
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
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 float-right">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDelete(request.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
