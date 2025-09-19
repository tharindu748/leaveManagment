import React, { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";

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
  start: string;
  lastOut: string;
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
// Mock data generation

type DayRecord = {
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  lastOut: string; // HH:mm
  workedSeconds: number;
  notWorkingSeconds: number;
  overtimeSeconds: number;
};

type Employee = { id: string; name: string; records: DayRecord[] };

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function genMockForMonth(
  year: number,
  monthIndex0: number,
  employees: string[]
): Employee[] {
  const end = new Date(year, monthIndex0 + 1, 0);
  const daysInMonth = end.getDate();

  return employees.map((name, idx) => {
    const rnd = seededRandom(year * 1000 + monthIndex0 * 50 + idx);
    const records: DayRecord[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex0, day);
      const dow = d.getDay(); // 0 Sun .. 6 Sat
      const isWeekend = dow === 0 || dow === 6;

      const workedH = isWeekend
        ? rnd() < 0.2
          ? 4 + Math.floor(rnd() * 2)
          : 0
        : 7 + Math.floor(rnd() * 3);
      const workedSeconds = workedH * 3600 + Math.floor(rnd() * 60) * 60;
      const notWork = workedSeconds === 0 ? 0 : (0.5 + rnd() * 1.5) * 3600; // 0.5-2h
      const overtime =
        workedSeconds > 8 * 3600 ? Math.max(0, workedSeconds - 8 * 3600) : 0;

      // start/lastOut
      let startH = 9 + Math.floor(rnd() * 2); // 9-10
      let startM = Math.floor(rnd() * 60);
      let startStr = `${pad(startH)}:${pad(startM)}`;
      let lastOutStr = startStr;
      if (workedSeconds > 0) {
        const endDate = new Date(d);
        endDate.setHours(startH, startM, 0, 0);
        endDate.setSeconds(endDate.getSeconds() + workedSeconds + notWork);
        lastOutStr = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
      }

      records.push({
        date: toDateKey(d),
        start: workedSeconds > 0 ? startStr : "-",
        lastOut: workedSeconds > 0 ? lastOutStr : "-",
        workedSeconds,
        notWorkingSeconds: Math.floor(notWork),
        overtimeSeconds: Math.floor(overtime),
      });
    }

    return { id: `emp-${idx + 1}`, name, records };
  });
}

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
// Component wired to your DataTable

export default function TimeCalcPage() {
  const today = new Date();
  const [mode, setMode] = useState<Mode>("day");
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(today));
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  );
  const [search, setSearch] = useState("");

  const employeeNames = useMemo(
    () => [
      "Alice Fernando",
      "Bimal Perera",
      "Chen Li",
      "Dulani Wijesinghe",
      "Eshan Jayasuriya",
      "Fatima Khan",
      "Gihan Silva",
    ],
    []
  );

  const dataset = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map((n) => parseInt(n, 10));
    return genMockForMonth(y, m - 1, employeeNames);
  }, [employeeNames, selectedMonth]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dataset;
    return dataset.filter((e) => e.name.toLowerCase().includes(q));
  }, [dataset, search]);

  const dayRows = useMemo<DayRow[]>(() => {
    if (mode !== "day") return [];
    return filtered.map((e) => {
      const rec = e.records.find((r) => r.date === selectedDate);
      const r =
        rec ||
        ({
          start: "-",
          lastOut: "-",
          workedSeconds: 0,
          notWorkingSeconds: 0,
          overtimeSeconds: 0,
        } as DayRecord);
      return {
        employee: e.name,
        start: r.start,
        lastOut: r.lastOut,
        workedSeconds: r.workedSeconds,
        notWorkingSeconds: r.notWorkingSeconds,
        overtimeSeconds: r.overtimeSeconds,
      };
    });
  }, [filtered, mode, selectedDate]);

  const monthRows = useMemo<MonthRow[]>(() => {
    if (mode !== "month") return [];
    const [y, m] = selectedMonth.split("-").map((n) => parseInt(n, 10));
    return filtered.map((e) => {
      const sums = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
      e.records.forEach((r) => {
        if (!r.date.startsWith(`${y}-${pad(m)}`)) return;
        const d = new Date(r.date + "T00:00:00");
        const dow = d.getDay();
        sums[dow] += r.workedSeconds;
      });
      return {
        employee: e.name,
        mon: sums[1],
        tue: sums[2],
        wed: sums[3],
        thu: sums[4],
        fri: sums[5],
        sat: sums[6],
        sun: sums[0],
      };
    });
  }, [filtered, mode, selectedMonth]);

  // Keep pickers in sync when user changes day to a different month
  useEffect(() => {
    if (mode !== "day") return;
    const d = new Date(selectedDate + "T00:00:00");
    const monthStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    if (monthStr !== selectedMonth) setSelectedMonth(monthStr);
  }, [mode, selectedDate]);

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <PageHeaderTitle value="Timing" />
            <p className="text-xs text-gray-500">
              Mocked data · switch Day/Month to change table headers.
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
        {mode === "day" ? (
          <DataTable columns={dayColumns} data={dayRows} />
        ) : (
          <DataTable columns={monthColumns} data={monthRows} />
        )}
      </div>
    </div>
  );
}
