import { useMemo } from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "@/components/data-table";
import { formatSeconds, pad } from "../utils/time";
import type { MonthRow, AttendanceMonthResponse } from "../types/types";

const monthColumns: ColumnDef<MonthRow>[] = [
  { accessorKey: "employee", header: "Employee" },
  {
    accessorKey: "mon",
    header: "Mon",
    cell: ({ row }) => <span>{formatSeconds(row.original.mon)}</span>,
  },
  {
    accessorKey: "tue",
    header: "Tue",
    cell: ({ row }) => <span>{formatSeconds(row.original.tue)}</span>,
  },
  {
    accessorKey: "wed",
    header: "Wed",
    cell: ({ row }) => <span>{formatSeconds(row.original.wed)}</span>,
  },
  {
    accessorKey: "thu",
    header: "Thu",
    cell: ({ row }) => <span>{formatSeconds(row.original.thu)}</span>,
  },
  {
    accessorKey: "fri",
    header: "Fri",
    cell: ({ row }) => <span>{formatSeconds(row.original.fri)}</span>,
  },
  {
    accessorKey: "sat",
    header: "Sat",
    cell: ({ row }) => <span>{formatSeconds(row.original.sat)}</span>,
  },
  {
    accessorKey: "sun",
    header: "Sun",
    cell: ({ row }) => <span>{formatSeconds(row.original.sun)}</span>,
  },
];

export default function MonthTable({
  data,
  search,
  selectedMonth,
}: {
  data: AttendanceMonthResponse | null;
  search: string;
  selectedMonth: string;
}) {
  const rows = useMemo<MonthRow[]>(() => {
    if (!data) return [];
    const [y, m] = selectedMonth.split("-").map((n) => parseInt(n, 10));
    const base = data.employees.map((emp) => {
      const sums = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
      emp.records.forEach((r) => {
        if (!r.date.startsWith(`${y}-${pad(m)}`)) return;
        const d = new Date(r.date + "T00:00:00");
        const dow = d.getDay();
        sums[dow] += r.workedSeconds;
      });
      return {
        employee: emp.name,
        mon: sums[1],
        tue: sums[2],
        wed: sums[3],
        thu: sums[4],
        fri: sums[5],
        sat: sums[6],
        sun: sums[0],
      } as MonthRow;
    });
    const q = search.trim().toLowerCase();
    return q ? base.filter((r) => r.employee.toLowerCase().includes(q)) : base;
  }, [data, search, selectedMonth]);

  return <DataTable2 columns={monthColumns} data={rows} />;
}
