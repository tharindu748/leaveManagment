import { useState } from "react";
import type { LeaveType } from "../hooks/use-leave";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onApplyLeave: (date: Date | null, type: LeaveType) => void;
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onApplyLeave,
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (leaveType) {
      onApplyLeave(selectedDate, leaveType);
      onClose();
    }
  };

  const formattedDate = selectedDate?.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            Select leave type
          </h3>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>
        <div className="p-4">
          <label className="sr-only" htmlFor="leave-type">
            Leave type
          </label>
          <select
            id="leave-type"
            className="w-full p-2 border rounded"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType | "")}
          >
            <option value="">- Select -</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Casual &amp; Sick Leave</option>
          </select>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              isProceedDisabled
                ? "bg-gray-200 opacity-60 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
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
