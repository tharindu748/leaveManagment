import { useState } from "react";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onApplyLeave: (date: Date | null, type: string) => void;
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onApplyLeave,
}) => {
  const [leaveType, setLeaveType] = useState<string>("");

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

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Select leave type</h3>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>
        <div className="p-4">
          <select
            className="w-full p-2 border rounded"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">- Select -</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Casual & Sick Leave</option>
          </select>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            CANCEL
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleSubmit}
            disabled={!leaveType}
          >
            PROCEED
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;
