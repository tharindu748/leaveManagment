import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Leave } from "../hooks/use-leave";

interface CalendarProps {
  onDayClick: (date: Date) => void;
  // Only the fields this component uses
  leaves: Array<Pick<Leave, "id" | "date" | "status">>;
}

const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = ({ onDayClick, leaves }: CalendarProps) => {
  const today = new Date();
  // Start on the first of the current month for stability
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Normalize JS Sunday=0..Saturday=6 to Monday=0..Sunday=6
  const firstDayOffset = useMemo(() => {
    const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
    return (jsDay + 6) % 7; // 0=Mon
  }, [year, month]);

  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month]
  );

  const cells: Array<number | null> = useMemo(() => {
    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDayOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    // Fill to 6 rows x 7 columns to avoid layout jumps
    while (arr.length < 42) arr.push(null);
    return arr;
  }, [firstDayOffset, daysInMonth]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getLeave = (day: number | null) => {
    if (day === null) return null;
    const key = formatDateKey(year, month, day);
    return leaves.find((l) => l.date === key) ?? null;
  };

  const isToday = (day: number | null): boolean =>
    !!(
      day &&
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getOrdinal = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-xl text-gray-800">
          Company Calendar
        </h3>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span
            className="font-semibold text-lg text-gray-800"
            aria-live="polite"
          >
            {monthName} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-medium text-white bg-blue-600 rounded-t-lg">
        {WEEKDAYS_MON_FIRST.map((label) => (
          <div key={label} className="py-3 border-b border-blue-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-gray-200">
        {cells.map((day, i) => {
          const leave = getLeave(day);
          const status = leave?.status;
          const clickable = day !== null;

          const borderClass = isToday(day)
            ? "border-2 border-blue-500"
            : "border border-gray-200";

          const bgClass = [
            clickable ? "bg-white" : "bg-gray-50",
            isToday(day) ? "bg-blue-50" : "",
            status === "pending"
              ? "bg-yellow-200"
              : status === "approved"
              ? "bg-green-200"
              : status === "rejected"
              ? "bg-red-200"
              : "",
          ].join(" ");

          return (
            <div
              key={i}
              className={[
                "aspect-square flex flex-col items-center justify-center",
                borderClass,
                bgClass,
                clickable
                  ? "hover:bg-gray-50 cursor-pointer transition-colors"
                  : "cursor-default",
              ].join(" ")}
              onClick={() =>
                clickable && onDayClick(new Date(year, month, day!))
              }
              aria-disabled={!clickable}
              role="button"
            >
              <span className="font-medium text-lg text-gray-800">
                {day ?? ""}
              </span>

              {leave && (
                <span
                  className="text-xs sm:text-sm text-gray-600 font-medium text-center mt-1 truncate"
                  title={`Leave status: ${status}`}
                >
                  {getOrdinal(leave.id)} Leave
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end space-x-4 text-sm text-gray-600 mt-6 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 border border-gray-300 rounded" />
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 border border-gray-300 rounded" />
          <span>Approved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-200 border border-gray-300 rounded" />
          <span>Rejected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
