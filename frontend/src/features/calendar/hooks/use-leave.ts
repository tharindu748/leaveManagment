import { useState } from "react";

// Leave type
export type LeaveType = "ANNUAL" | "CASUAL";

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
  available: number; // remaining days not pending or used
  pending: number;
  used: number;
}

// Main leaves data structure
export interface LeavesData {
  annualLeave: LeaveSummary;
  casualSickLeave: LeaveSummary;
  leaves: Leave[];
}

const initialData: LeavesData = {
  annualLeave: { total: 14, available: 12, pending: 2, used: 0 },
  casualSickLeave: { total: 7, available: 4, pending: 1, used: 2 },
  leaves: [
    { id: 1, date: "2025-09-01", type: "ANNUAL", status: "approved" },
    { id: 2, date: "2025-09-02", type: "ANNUAL", status: "approved" },
    { id: 3, date: "2025-09-06", type: "CASUAL", status: "pending" },
  ],
};

export function useLeave() {
  const [leaves, setLeaves] = useState<LeavesData>(initialData);

  const applyLeave = (date: string, type: LeaveType): Leave => {
    const newLeave: Leave = {
      id: leaves.leaves.length + 1,
      date,
      type,
      status: "pending",
    };

    setLeaves((prev) => {
      const key = type === "ANNUAL" ? "annualLeave" : "casualSickLeave";
      const summary = { ...prev[key] };

      if (summary.available > 0) {
        summary.available -= 1;
        summary.pending += 1;
      }

      return {
        ...prev,
        [key]: summary,
        leaves: [...prev.leaves, newLeave],
      };
    });

    return newLeave;
  };

  return { leaves, applyLeave };
}
