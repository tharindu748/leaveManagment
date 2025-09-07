import { useState } from "react";

// Leave type
export type LeaveType = "annual" | "sick";

// Status type
export type LeaveStatus = "pending" | "approved" | "rejected";

// Individual leave entry
export interface Leave {
  id: number;
  date: string; // YYYY-MM-DD
  type: LeaveType;
  status: LeaveStatus;
}

// Leave summary
export interface LeaveSummary {
  total: number;
  available: number;
  pending: number;
  used: number;
}

// Main leaves data structure
export interface LeavesData {
  annualLeave: LeaveSummary;
  casualSickLeave: LeaveSummary;
  leaves: Leave[];
}

const leavesData: LeavesData = {
  annualLeave: { total: 14, available: 12, pending: 2, used: 0 },
  casualSickLeave: { total: 7, available: 4, pending: 1, used: 2 },
  leaves: [
    { id: 1, date: "2025-09-01", type: "annual", status: "approved" },
    { id: 2, date: "2025-09-02", type: "annual", status: "approved" },
    { id: 3, date: "2025-09-06", type: "sick", status: "pending" },
  ],
};

export function useLeave() {
  const [leaves, setLeaves] = useState<LeavesData>(leavesData);

  const applyLeave = (date: string, type: LeaveType): Leave => {
    const newLeave: Leave = {
      id: leaves.leaves.length + 1,
      date,
      type,
      status: "pending",
    };

    setLeaves((prev) => ({
      ...prev,
      leaves: [...prev.leaves, newLeave],
    }));

    return newLeave;
  };

  return { leaves, applyLeave };
}
