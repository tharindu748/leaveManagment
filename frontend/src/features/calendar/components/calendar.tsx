import { Button } from "@/components/ui/button";
import { Calendar1, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Leave } from "../hooks/use-leave";

interface CalendarProps {
  onDayClick: (date: Date) => void;
  selectedDates?: Date[];
  leaves: Array<Pick<Leave, "id" | "date" | "status" | "isHalfDay">>;
}
type CalendarLeaf = CalendarProps["leaves"][number];

const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusBg: Record<"pending" | "approved" | "rejected", string> = {
  pending: "!bg-yellow-100",
  approved: "!bg-green-100",
  rejected: "!bg-red-100",
};

const Calendar = ({
  onDayClick,
  leaves,
  selectedDates = [],
}: CalendarProps) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const leavesByDate = useMemo(() => {
    const map = new Map<string, CalendarLeaf[]>();
    for (const l of leaves) {
      if (!map.has(l.date)) map.set(l.date, []);
      map.get(l.date)!.push(l);
    }
    return map;
  }, [leaves]);

  const gridStart = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const jsDay = firstOfMonth.getDay();
    const mondayIndex = (jsDay + 6) % 7;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - mondayIndex);
    return start;
  }, [year, month]);

  const cells: Date[] = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        return d;
      }),
    [gridStart]
  );

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <Calendar1 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Company Calendar
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Manage your leave schedule
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-white/10 rounded-lg backdrop-blur">
              <Button
                variant="outline"
                size="icon"
                className="p-2 hover:bg-white/10 text-white rounded-l-lg transition-all duration-200"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="px-4 font-semibold text-lg text-white min-w-[140px] text-center">
                {monthName} {year}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="p-2 hover:bg-white/10 text-white rounded-r-lg transition-all duration-200"
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS_MON_FIRST.map((label, index) => (
          <div
            key={label}
            className={`text-center py-3 text-xs font-semibold uppercase tracking-wider ${
              index >= 5 ? "text-slate-500" : "text-slate-700"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const inCurrentMonth = d.getMonth() === month;
          const key = formatKey(d);
          const leavesOnDate = leavesByDate.get(key) ?? [];
          const clickable = inCurrentMonth;

          let status: "pending" | "approved" | "rejected" | "" = "";
          if (leavesOnDate.some((l) => l.status === "APPROVED")) {
            status = "approved";
          } else if (leavesOnDate.some((l) => l.status === "PENDING")) {
            status = "pending";
          } else if (
            leavesOnDate.some(
              (l) => l.status === "CANCELLED" || l.status === "REJECTED"
            )
          ) {
            status = "rejected";
          }

          const isSelected = selectedDates.some(
            (sd) =>
              sd.getFullYear() === d.getFullYear() &&
              sd.getMonth() === d.getMonth() &&
              sd.getDate() === d.getDate()
          );

          const borderClass = isToday(d)
            ? "border-2 border-blue-500"
            : "border border-gray-200";

          const statusClass = status ? statusBg[status] : "";

          const baseBg = inCurrentMonth ? "bg-white" : "bg-slate-50";
          const selectedOverride = isSelected
            ? "!bg-yellow-200 ring-2 ring-yellow-500"
            : "";
          const hoverClass = clickable && !isSelected ? "hover:bg-gray-50" : "";

          const bgClass = [statusClass || baseBg, selectedOverride].join(" ");

          const textClass = isSelected
            ? "text-slate-900"
            : inCurrentMonth
            ? "text-gray-800"
            : "text-slate-400";

          return (
            <div
              key={i}
              className={[
                "aspect-square flex flex-col items-center justify-center",
                borderClass,
                bgClass,
                clickable
                  ? `${hoverClass} cursor-pointer transition-colors`
                  : "cursor-default",
              ].join(" ")}
              onClick={() => clickable && onDayClick(d)}
              aria-disabled={!clickable}
              role="button"
            >
              <span className={`font-medium text-lg ${textClass}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded" />
            <span className="text-sm font-medium text-slate-600">
              Pending / Requested
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
            <span className="text-sm font-medium text-slate-600">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
            <span className="text-sm font-medium text-slate-600">
              Rejected / Cancelled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded" />
            <span className="text-sm font-medium text-slate-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded" />
            <span className="text-sm font-medium text-slate-600">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
