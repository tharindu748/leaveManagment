import { type ColumnDef } from "@tanstack/react-table";
import { formatSeconds } from "@/utils/time";

export type Calculate = {
  Date: string;
  StartTime: string;
  LastOut: string;
  WorkHours: string;
  NotWorkHours: string;
  OverTime: string;
};

export const columns: ColumnDef<Calculate>[] = [
  {
    accessorKey: "workDate",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue("workDate") as string;
      const date = new Date(value);
      return (
        <div className="flex flex-wrap gap-1">
          {date.toLocaleDateString("en-CA")}
        </div>
      );
    },
  },
  {
    accessorKey: "firstIn",
    header: "Start Time",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("firstIn") as string}
      </div>
    ),
  },
  {
    accessorKey: "lastOut",
    header: "Last Out",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("lastOut") as string}
      </div>
    ),
  },
  {
    accessorKey: "workedSeconds",
    header: "Work Hours",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("workedSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "notWorkingSeconds",
    header: "Not Work Hours",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("notWorkingSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "overtimeSeconds",
    header: "OverTime",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("overtimeSeconds")))}
      </div>
    ),
  },
];
