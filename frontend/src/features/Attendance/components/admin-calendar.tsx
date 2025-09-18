import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, X, User } from "lucide-react";
import { useMemo, useState } from "react";

// Mock data types
interface Leave {
  id: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  userId: string;
  userName: string;
  leaveType: string;
  reason: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@company.com",
    department: "Engineering",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    department: "Marketing",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@company.com",
    department: "Sales",
  },
  { id: "4", name: "Emma Davis", email: "emma@company.com", department: "HR" },
  {
    id: "5",
    name: "Alex Brown",
    email: "alex@company.com",
    department: "Engineering",
  },
  {
    id: "6",
    name: "Lisa Garcia",
    email: "lisa@company.com",
    department: "Finance",
  },
];

const mockLeaves: Leave[] = [
  {
    id: "1",
    date: "2025-09-15",
    status: "approved",
    userId: "1",
    userName: "John Smith",
    leaveType: "Annual",
    reason: "Family vacation",
  },
  {
    id: "2",
    date: "2025-09-15",
    status: "pending",
    userId: "2",
    userName: "Sarah Johnson",
    leaveType: "Sick",
    reason: "Medical appointment",
  },
  {
    id: "3",
    date: "2025-09-16",
    status: "rejected",
    userId: "3",
    userName: "Mike Wilson",
    leaveType: "Personal",
    reason: "Personal matters",
  },
  {
    id: "4",
    date: "2025-09-18",
    status: "approved",
    userId: "4",
    userName: "Emma Davis",
    leaveType: "Annual",
    reason: "Wedding anniversary",
  },
  {
    id: "5",
    date: "2025-09-18",
    status: "approved",
    userId: "5",
    userName: "Alex Brown",
    leaveType: "Annual",
    reason: "Long weekend",
  },
  {
    id: "6",
    date: "2025-09-18",
    status: "pending",
    userId: "6",
    userName: "Lisa Garcia",
    leaveType: "Sick",
    reason: "Doctor visit",
  },
  {
    id: "7",
    date: "2025-09-20",
    status: "pending",
    userId: "1",
    userName: "John Smith",
    leaveType: "Personal",
    reason: "House moving",
  },
  {
    id: "8",
    date: "2025-09-22",
    status: "approved",
    userId: "2",
    userName: "Sarah Johnson",
    leaveType: "Annual",
    reason: "Short break",
  },
  {
    id: "9",
    date: "2025-09-25",
    status: "rejected",
    userId: "3",
    userName: "Mike Wilson",
    leaveType: "Annual",
    reason: "Vacation",
  },
  {
    id: "10",
    date: "2025-09-25",
    status: "pending",
    userId: "4",
    userName: "Emma Davis",
    leaveType: "Sick",
    reason: "Flu symptoms",
  },
];

interface CalendarProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  onDayClick?: (date: Date) => void;
  selectedDates?: Date[];
  leaves?: Leave[];
}

const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface LeavePopupProps {
  date: Date;
  leaves: Leave[];
  onClose: () => void;
}

const LeavePopup = ({ date, leaves, onClose }: LeavePopupProps) => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
  const dayLeaves = leaves.filter((leave) => leave.date === dateStr);

  const counts = {
    approved: dayLeaves.filter((l) => l.status === "approved").length,
    pending: dayLeaves.filter((l) => l.status === "pending").length,
    rejected: dayLeaves.filter((l) => l.status === "rejected").length,
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${
      styles[status as keyof typeof styles]
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Leave Details</h3>
                <p className="text-slate-300 text-sm">{formatDate(date)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-b bg-slate-50">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {counts.approved}
              </div>
              <div className="text-sm text-slate-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {counts.pending}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {counts.rejected}
              </div>
              <div className="text-sm text-slate-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Leave List */}
        <div className="max-h-96 overflow-y-auto">
          {dayLeaves.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leave applications for this date</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {dayLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {leave.userName}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {leave.leaveType} Leave
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 ml-11">
                        {leave.reason}
                      </p>
                    </div>
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() +
                        leave.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminCalendar = ({
  open,
  onOpenChange,
  onDayClick,
  leaves = mockLeaves,
  selectedDates = [],
}: CalendarProps) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Build a lookup for leaves by date with counts
  const leavesByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        approved: number;
        pending: number;
        rejected: number;
        total: number;
      }
    >();

    for (const leave of leaves) {
      const existing = map.get(leave.date) || {
        approved: 0,
        pending: 0,
        rejected: 0,
        total: 0,
      };
      existing[leave.status]++;
      existing.total++;
      map.set(leave.date, existing);
    }

    return map;
  }, [leaves]);

  // Compute grid start (Monday-first)
  const gridStart = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const jsDay = firstOfMonth.getDay();
    const mondayIndex = (jsDay + 6) % 7;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - mondayIndex);
    return start;
  }, [year, month]);

  // 35 calendar cells (5 rows)
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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDayClick?.(date);
  };

  const closePopup = () => {
    setSelectedDate(null);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl [&>button]:hidden p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>Calendar</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
                type="button"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-full">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Admin Leave Calendar
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">
                      Monitor team leave applications
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-white/10 rounded-lg backdrop-blur">
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-2 hover:bg-white/10 text-white rounded-l-lg transition-all duration-200 border-white/20"
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
                    className="p-2 hover:bg-white/10 text-white rounded-r-lg transition-all duration-200 border-white/20"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Week header */}
          <div className="grid grid-cols-7 mb-2 mt-6">
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

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              const inCurrentMonth = d.getMonth() === month;
              const key = formatKey(d);
              const leaveCounts = leavesByDate.get(key);
              const clickable = inCurrentMonth;

              const borderClass = isToday(d)
                ? "border-2 border-blue-500"
                : "border border-gray-200";

              const baseBg = inCurrentMonth ? "bg-white" : "bg-slate-50";
              const hoverClass = clickable ? "hover:bg-gray-50" : "";

              const textClass = inCurrentMonth
                ? "text-gray-800"
                : "text-slate-400";

              return (
                <div
                  key={i}
                  className={[
                    "aspect-square flex flex-col items-center justify-center relative",
                    borderClass,
                    baseBg,
                    clickable
                      ? `${hoverClass} cursor-pointer transition-colors`
                      : "cursor-default",
                  ].join(" ")}
                  onClick={() => clickable && handleDayClick(d)}
                  aria-disabled={!clickable}
                  role="button"
                >
                  <span className={`font-medium text-lg ${textClass} mb-1`}>
                    {d.getDate()}
                  </span>

                  {/* Leave counts */}
                  {leaveCounts && inCurrentMonth && (
                    <div className="flex gap-1 text-xs">
                      {leaveCounts.approved > 0 && (
                        <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[16px] text-center">
                          {leaveCounts.approved}
                        </span>
                      )}
                      {leaveCounts.pending > 0 && (
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[16px] text-center">
                          {leaveCounts.pending}
                        </span>
                      )}
                      {leaveCounts.rejected > 0 && (
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[16px] text-center">
                          {leaveCounts.rejected}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded-full" />
                <span className="text-sm font-medium text-slate-600">
                  Approved Leave Count
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full" />
                <span className="text-sm font-medium text-slate-600">
                  Pending Leave Count
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full" />
                <span className="text-sm font-medium text-slate-600">
                  Rejected Leave Count
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded" />
                <span className="text-sm font-medium text-slate-600">
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popup */}
        {selectedDate && (
          <LeavePopup
            date={selectedDate}
            leaves={leaves}
            onClose={closePopup}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminCalendar;
