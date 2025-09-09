import React, { useState } from "react";
import type { LeaveType } from "../hooks/use-leave";

type DayDuration = "FULL" | "MORNING" | "AFTERNOON";

interface LeaveSidePanelProps {
  leaveType: LeaveType | "";
  setLeaveType: (type: LeaveType | "") => void;
  selectedDates: Date[];
  dayDurations: Record<string, DayDuration>;
  handleDurationChange: (date: Date, value: DayDuration) => void;
  handleApplyLeave: (reason: string) => Promise<void>;
  removeDate: (date: Date) => void;
}

const LeaveSidePanel: React.FC<LeaveSidePanelProps> = ({
  leaveType,
  setLeaveType,
  selectedDates,
  dayDurations,
  handleDurationChange,
  handleApplyLeave,
  removeDate,
}) => {
  const [reason, setReason] = useState("");

  const formatKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const buildDatesPayload = () =>
    selectedDates.map((d) => {
      const key = formatKey(d);
      const duration = dayDurations[key] || "FULL";
      if (duration === "FULL") {
        return { date: key, isHalfDay: false };
      }
      return {
        date: key,
        isHalfDay: true,
        halfDayType: duration as "MORNING" | "AFTERNOON",
      };
    });

  const handleApplyClick = async () => {
    if (!leaveType || selectedDates.length === 0) return;

    const body = {
      userId: 1,
      approvedBy: null,
      leaveType: leaveType as LeaveType,
      reason: reason || undefined,
      dates: buildDatesPayload(),
    };

    try {
      await handleApplyLeave(reason); // update local UI (parent)
      setReason("");
    } catch (e: any) {
      console.error("Leave submit failed:", e?.response?.data || e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Apply Leave</h2>

      {/* Leave type dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Leave Type</label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType | "")}
        >
          <option value="">Select Leave type</option>
          <option value="ANNUAL">Annual Leave</option>
          <option value="CASUAL">Casual Leave</option>
        </select>
      </div>

      {/* Selected days list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {selectedDates.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Click days in the calendar to add them here
          </p>
        ) : (
          selectedDates.map((date) => {
            const key = formatKey(date);
            return (
              <div
                key={key}
                className="flex items-center justify-between border-b py-2"
              >
                <span className="text-sm">{date.toDateString()}</span>

                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-md px-2 py-1"
                    value={dayDurations[key] || "FULL"}
                    onChange={(e) =>
                      handleDurationChange(date, e.target.value as DayDuration)
                    }
                  >
                    <option value="FULL">Full Day</option>
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                  </select>

                  <button
                    onClick={() => removeDate(date)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reason textbox */}
      {selectedDates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            className="w-full border rounded-md px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need the above leave(s)? (Optional)"
            rows={3}
          />
        </div>
      )}

      {/* Apply button */}
      {selectedDates.length > 0 && (
        <button
          onClick={handleApplyClick}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={!leaveType}
        >
          Apply Leave
        </button>
      )}
    </div>
  );
};

export default LeaveSidePanel;
