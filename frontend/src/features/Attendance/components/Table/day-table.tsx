// import React, { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "@/components/data-table";
import { formatSeconds } from "../utils/time";
import type { DayRow, AttendanceDayResponse } from "../types/types";

const dayColumns: ColumnDef<DayRow>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "start", header: "Start" },
  { accessorKey: "lastOut", header: "Last Out" },
  {
    accessorKey: "workedSeconds",
    header: "Work",
    cell: ({ row }) => <span>{formatSeconds(row.original.workedSeconds)}</span>,
  },
  {
    accessorKey: "notWorkingSeconds",
    header: "Not Work",
    cell: ({ row }) => (
      <span>{formatSeconds(row.original.notWorkingSeconds)}</span>
    ),
  },
  {
    accessorKey: "overtimeSeconds",
    header: "Overtime",
    cell: ({ row }) => (
      <span>{formatSeconds(row.original.overtimeSeconds)}</span>
    ),
  },
];

export default function DayTable({
  data,
  search,
}: {
  data: AttendanceDayResponse | null;
  search: string;
}) {
  const rows = useMemo<DayRow[]>(() => {
    if (!data) return [];
    const base = data.employees.map((e) => ({
      employee: e.name,
      start: e.start,
      lastOut: e.lastOut,
      workedSeconds: e.workedSeconds,
      notWorkingSeconds: e.notWorkingSeconds,
      overtimeSeconds: e.overtimeSeconds,
    }));
    const q = search.trim().toLowerCase();
    return q ? base.filter((r) => r.employee.toLowerCase().includes(q)) : base;
  }, [data, search]);

  return <DataTable2 columns={dayColumns} data={rows} />;
}
