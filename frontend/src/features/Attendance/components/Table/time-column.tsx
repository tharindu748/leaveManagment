import { type ColumnDef } from "@tanstack/react-table";
import { formatSeconds } from "@/utils/time";

export type Calculate = {
  Employee: string;
  StartTime: string;
  LastOut: string;
  WorkHours: string;
  NotWorkHours: string;
  OverTime: string;
};

export const timeCalcColumns: ColumnDef<Calculate>[] = [
  {
    accessorKey: "firstIn",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("firstIn") as string}
      </div>
    ),
  },
  {
    accessorKey: "firstIn",
    header: "MON",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("firstIn") as string}
      </div>
    ),
  },
  {
    accessorKey: "lastOut",
    header: "TUE",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("lastOut") as string}
      </div>
    ),
  },
  {
    accessorKey: "workedSeconds",
    header: "WED",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("workedSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "notWorkingSeconds",
    header: "THU",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("notWorkingSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "overtimeSeconds",
    header: "FRI",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("overtimeSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "overtimeSeconds",
    header: "SAT",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("overtimeSeconds")))}
      </div>
    ),
  },
  {
    accessorKey: "overtimeSeconds",
    header: "SUN",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {formatSeconds(Number(row.getValue("overtimeSeconds")))}
      </div>
    ),
  },
];
