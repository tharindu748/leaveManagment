import { type ColumnDef } from "@tanstack/react-table";

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
    accessorKey: "Date",
    header: "Date",
    cell: ({ row }) => {
      const channels = row.getValue("Date") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
  {
    accessorKey: "StartTime",
    header: "Start Time",
    cell: ({ row }) => {
      const channels = row.getValue("StartTime") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
  {
    accessorKey: "LastOut",
    header: "Last Out",
    cell: ({ row }) => {
      const channels = row.getValue("LastOut") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
  {
    accessorKey: "WorkHours",
    header: "Work Hours",
    cell: ({ row }) => {
      const channels = row.getValue("WorkHours") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
  {
    accessorKey: "NotWorkHours",
    header: "Not Work Hours",
    cell: ({ row }) => {
      const channels = row.getValue("NotWorkHours") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
  {
    accessorKey: "OverTime",
    header: "OverTime",
    cell: ({ row }) => {
      const channels = row.getValue("OverTime") as string;
      return <div className="flex flex-wrap gap-1">{channels}</div>;
    },
  },
];
