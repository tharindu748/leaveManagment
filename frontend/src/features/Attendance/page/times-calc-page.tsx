import React, { useEffect, useState } from "react";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import { toDateKey, pad } from "../components/utils/time";
import type { Mode } from "../components/types/types";
import { useAttendance } from "../components/hooks/useAttendance";
import Toolbar from "../components/Toolbar";
import DayTable from "../components/Table/day-table";
import MonthTable from "../components/Table/month-table";

export default function TimeCalcPage() {
  const today = new Date();
  const [mode, setMode] = useState<Mode>("day");
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(today));
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  );
  const [search, setSearch] = useState("");

  const { monthData, dayData, loading, error } = useAttendance(
    mode,
    selectedDate,
    selectedMonth
  );

  // Keep month in sync when day changes month
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
              Live data · switch Day/Month to change table headers.
            </p>
          </div>
          <Toolbar
            mode={mode}
            setMode={setMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            search={search}
            setSearch={setSearch}
          />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-4">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : mode === "day" ? (
          <DayTable data={dayData} search={search} />
        ) : (
          <MonthTable
            data={monthData}
            search={search}
            selectedMonth={selectedMonth}
          />
        )}
      </div>
    </div>
  );
}
