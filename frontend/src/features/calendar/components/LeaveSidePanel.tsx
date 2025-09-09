import React, { useState } from "react";
import type { LeaveType } from "../hooks/use-leave";

interface LeaveSidePanelProps {
  leaveType: LeaveType;
  setLeaveType: (type: LeaveType) => void;
  selectedDates: Date[];
  dayDurations: Record<string, "full" | "half" | "afternoon">;
  handleDurationChange: (date: Date, value: "full" | "half" | "afternoon") => void;
  handleApplyLeave: (reason: string) => void;
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

  // Optional: debug logging before applying
  const handleApplyClick = () => {
    console.log("Applying leave from Side Panel:");
    console.log("Selected Dates:", selectedDates);
    console.log("Leave Type:", leaveType);
    console.log("Day Durations:", dayDurations);
    console.log("Reason:", reason);

    // Call parent function to actually apply leave
    handleApplyLeave(reason);
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
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
        >
          <option value="">Select Leave type</option>
          <option value="annual">Annual Leave</option>
          <option value="casual">Casual Leave</option>
          <option value="sick">Sick Leave</option>
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
            const key = date.toISOString().split("T")[0];
            return (
              <div key={key} className="flex items-center justify-between border-b py-2">
                <span className="text-sm">{date.toDateString()}</span>

                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-md px-2 py-1"
                    value={dayDurations[key] || "full"}
                    onChange={(e) =>
                      handleDurationChange(date, e.target.value as "full" | "half" | "afternoon")
                    }
                  >
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                    <option value="afternoon">Afternoon</option>
                  </select>

                  {/* Remove button */}
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
      {selectedDates.length >0 && (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Reason</label>
        <textarea
          className="w-full border rounded-md px-3 py-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you need the above leave(s)? (Not mandatory!)"
          rows={3}
        />
       
      </div>
 )}
      {/* Apply button */}
      {selectedDates.length > 0 && (
        <button
          onClick={handleApplyClick}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Apply Leave
        </button>
      )}
    </div>
  );
};

export default LeaveSidePanel;
