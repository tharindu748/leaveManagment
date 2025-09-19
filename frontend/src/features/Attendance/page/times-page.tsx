import React, { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "@/components/data-table";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import api from "@/api/axios";

// ---------------------------------------------------------------------------
// Utilities
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatSeconds = (total: number) => {
  const sign = total < 0 ? "-" : "";
  total = Math.abs(total);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${sign}${pad(h)}:${pad(m)}`;
};
const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---------------------------------------------------------------------------
// Types for DataTable rows (two modes)

type Mode = "day" | "month";

export type DayRow = {
  employee: string;
  start: string | null;
  lastOut: string | null;
  workedSeconds: number;
  notWorkingSeconds: number;
  overtimeSeconds: number;
};

export type MonthRow = {
  employee: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
};

// ---------------------------------------------------------------------------
// API response types

type AttendanceMonthResponse = {
  month: string; // YYYY-MM
  timezone: string;
  employees: {
    id: string;
    name: string;
    records: {
      date: string; // YYYY-MM-DD
      start: string | null; // HH:mm or null
      lastOut: string | null;
      workedSeconds: number;
      notWorkingSeconds: number;
      overtimeSeconds: number;
    }[];
  }[];
};

type AttendanceDayResponse = {
  date: string; // YYYY-MM-DD
  timezone: string;
  employees: {
    id: string;
    name: string;
    start: string | null;
    lastOut: string | null;
    workedSeconds: number;
    notWorkingSeconds: number;
    overtimeSeconds: number;
  }[];
};

// ---------------------------------------------------------------------------
// Column defs per mode

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

// ---------------------------------------------------------------------------
// Component wired to your DataTable + real APIs

export default function TimeCalcPage() {
  const today = new Date();
  const [mode, setMode] = useState<Mode>("day");
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(today));
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  );
  const [search, setSearch] = useState("");

  const [monthData, setMonthData] = useState<AttendanceMonthResponse | null>(
    null
  );
  const [dayData, setDayData] = useState<AttendanceDayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetchers ---------------------------------------------------------------
  useEffect(() => {
    let cancel = false;
    const fetchMonth = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AttendanceMonthResponse>(
          `/attendance/records`,
          { params: { month: selectedMonth, tz: "Asia/Colombo" } }
        );
        if (!cancel) setMonthData(res.data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to load month data");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    if (mode === "month") fetchMonth();
    return () => {
      cancel = true;
    };
  }, [mode, selectedMonth]);

  useEffect(() => {
    let cancel = false;
    const fetchDay = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AttendanceDayResponse>(`/attendance/day`, {
          params: { date: selectedDate, tz: "Asia/Colombo" },
        });
        if (!cancel) setDayData(res.data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to load day data");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    if (mode === "day") fetchDay();
    return () => {
      cancel = true;
    };
  }, [mode, selectedDate]);

  // Keep pickers in sync when user changes day to a different month
  useEffect(() => {
    if (mode !== "day") return;
    const d = new Date(selectedDate + "T00:00:00");
    const monthStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    if (monthStr !== selectedMonth) setSelectedMonth(monthStr);
  }, [mode, selectedDate]);

  // Derived rows -----------------------------------------------------------
  const dayRows = useMemo<DayRow[]>(() => {
    if (mode !== "day" || !dayData) return [];
    const rows = dayData.employees.map((e) => ({
      employee: e.name,
      start: e.start,
      lastOut: e.lastOut,
      workedSeconds: e.workedSeconds,
      notWorkingSeconds: e.notWorkingSeconds,
      overtimeSeconds: e.overtimeSeconds,
    }));
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => r.employee.toLowerCase().includes(q)) : rows;
  }, [mode, dayData, search]);

  const monthRows = useMemo<MonthRow[]>(() => {
    if (mode !== "month" || !monthData) return [];
    const [y, m] = selectedMonth.split("-").map((n) => parseInt(n, 10));

    const rows = monthData.employees.map((emp) => {
      const sums = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
      emp.records.forEach((r) => {
        if (!r.date.startsWith(`${y}-${pad(m)}`)) return; // safety
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
    return q ? rows.filter((r) => r.employee.toLowerCase().includes(q)) : rows;
  }, [mode, monthData, selectedMonth, search]);

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <PageHeaderTitle value="Timing" />
            <p className="text-xs text-gray-500">
              Live data · switch Day/Month to change table headers.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <fieldset className="flex items-center gap-2 rounded-xl border px-3 py-2">
              <legend className="mr-2 text-xs uppercase tracking-wide text-gray-500">
                View
              </legend>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="mode"
                  className="accent-black"
                  checked={mode === "day"}
                  onChange={() => setMode("day")}
                />
                Day
              </label>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="mode"
                  className="accent-black"
                  checked={mode === "month"}
                  onChange={() => setMode("month")}
                />
                Month
              </label>
            </fieldset>

            {mode === "day" ? (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Date</span>
                <input
                  type="date"
                  className="rounded-lg border px-3 py-2"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </label>
            ) : (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Month</span>
                <input
                  type="month"
                  className="rounded-lg border px-3 py-2"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </label>
            )}

            <input
              type="search"
              placeholder="Search employee..."
              className="rounded-lg border px-3 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <div className="rounded-lg border p-4">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : mode === "day" ? (
          <DataTable2 columns={dayColumns} data={dayRows} />
        ) : (
          <DataTable2 columns={monthColumns} data={monthRows} />
        )}
      </div>
    </div>
  );
}
