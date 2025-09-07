import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Leave {
  id: number;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface CalendarProps {
  onDayClick: (date: Date) => void;
  leaves: Leave[];
}

const Calendar = ({ onDayClick, leaves }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));

  const today = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getLeave = (day: number | null) => {
    if (day === null) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return leaves.find((l) => l.date === dateStr) || null;
  };

  const isToday = (day: number | null) =>
    day &&
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getOrdinal = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  return (
    <>
      <div className="mt-6 bg-white rounded-lg shadow p-4 max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4 p-3 rounded">
          <h3 className="font-semibold text-lg">Company Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPreviousMonth}
              className="p-2 rounded hover:bg-gray-200 border border-gray-300"
            >
              ◀
            </Button>
            <span className="font-bold text-lg">
              {monthName} {year}
            </span>
            <Button
              onClick={goToNextMonth}
              className="p-2 rounded hover:bg-gray-200 border border-gray-300"
            >
              ▶
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center font-semibold text-white bg-blue-900">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="py-2 border border-gray-300">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-gray-300">
          {days.map((day, i) => {
            const leave = getLeave(day);
            const status = leave?.status;

            const bgColor =
              status === "pending"
                ? "bg-yellow-100"
                : status === "approved"
                ? "bg-green-100"
                : status === "rejected"
                ? "bg-red-100"
                : "bg-white";

            return (
              <div
                key={i}
                className={`aspect-square w-full max-w-full flex flex-col items-center justify-center border border-gray-300
                ${
                  day
                    ? "hover:bg-gray-100 cursor-pointer"
                    : "bg-gray-50 cursor-default"
                }
                ${isToday(day) ? "border-blue-500" : ""}
                ${bgColor}
              `}
                onClick={() => day && onDayClick(new Date(year, month, day))}
              >
                {/* Bigger date */}
                <span className="font-semibold text-lg">{day || ""}</span>

                {leave && (
                  <span
                    className="text-xs sm:text-sm text-gray-700 font-medium text-center mt-1"
                    title={`Leave status: ${status}`}
                  >
                    {getOrdinal(leave.id)} Leave
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-end space-x-4 text-xs text-gray-600 mt-4 gap-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-100 border rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border rounded"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border rounded"></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-blue-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;
