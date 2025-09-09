import { useState } from "react";
import type { LeaveType } from "../hooks/use-leave";

type DayDuration = "FULL" | "MORNING" | "AFTERNOON";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onApplyLeave: (
    date: Date | null,
    type: LeaveType,
    duration: DayDuration,
    reason: string
  ) => void;
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onApplyLeave,
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [duration, setDuration] = useState<DayDuration>("FULL");
  const [reason, setReason] = useState("");

  if (!isOpen || !selectedDate) return null;

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = () => {
    if (leaveType) {
      onApplyLeave(selectedDate, leaveType, duration, reason);
      setLeaveType("");
      setDuration("FULL");
      setReason("");
      onClose();
    }
  };

  const isProceedDisabled = !leaveType;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-modal-title"
      >
        <div className="p-4 border-b">
          <h3 id="leave-modal-title" className="font-semibold text-gray-800">
            Apply Leave
          </h3>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label
              htmlFor="leave-type"
              className="block text-sm font-medium mb-1"
            >
              Leave Type
            </label>
            <select
              id="leave-type"
              className="w-full p-2 border rounded"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType | "")}
            >
              <option value="">- Select -</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="CASUAL">Casual &amp; Sick Leave</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-1"
            >
              Duration
            </label>
            <select
              id="duration"
              className="w-full p-2 border rounded"
              value={duration}
              onChange={(e) => setDuration(e.target.value as DayDuration)}
            >
              <option value="FULL">Full Day</option>
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              Reason
            </label>
            <input
              type="text"
              id="reason"
              className="w-full p-2 border rounded"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type your reason (optional)"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => {
              setLeaveType("");
              setDuration("FULL");
              setReason("");
              onClose();
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              isProceedDisabled
                ? "bg-gray-200 opacity-60 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleSubmit}
            disabled={isProceedDisabled}
          >
            PROCEED
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;
