import { useEffect, useState } from "react";
import api from "@/api/axios";

export type LeaveType = "ANNUAL" | "CASUAL";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Leave {
  id: number;
  date: string;
  type: LeaveType;
  status: LeaveStatus;
}
export interface LeaveSummary {
  total: number;
  available: number;
  pending: number;
  used: number;
}
export interface LeavesData {
  annualLeave: LeaveSummary;
  casualSickLeave: LeaveSummary;
  leaves: Leave[];
}

const EMPTY: LeavesData = {
  annualLeave: { total: 0, available: 0, pending: 0, used: 0 },
  casualSickLeave: { total: 0, available: 0, pending: 0, used: 0 },
  leaves: [],
};

// ---- API shapes ----
type ApiLeaveDate = {
  id?: number;
  requestId?: number;
  leaveDate?: string;
  date?: string;
  isHalfDay?: boolean;
  halfdayType?: "MORNING" | "AFTERNOON" | null;
};
type ApiLeaveRequest = {
  id: number;
  userId: number;
  leaveType: "ANNUAL" | "CASUAL" | "SICK";
  status: "PENDING" | "APPROVED" | "REJECTED";
  dates: ApiLeaveDate[];
};

// ---- utils ----
const toYMD = (s: string) => (s ?? "").slice(0, 10);

const computeSummary = (
  flat: Leave[],
  type: LeaveType,
  total: number
): LeaveSummary => {
  const used = flat.filter(
    (l) => l.type === type && l.status === "APPROVED"
  ).length;
  const pending = flat.filter(
    (l) => l.type === type && l.status === "PENDING"
  ).length;
  const available = Math.max(total - used - pending, 0);
  return { total, used, pending, available };
};

function normalizeFromRequests(
  rows: ApiLeaveRequest[],
  totals = { annual: 14, casual: 7 }
): LeavesData {
  const flat: Leave[] = rows.flatMap((r) => {
    const type: LeaveType = r.leaveType === "ANNUAL" ? "ANNUAL" : "CASUAL";
    return (r.dates ?? [])
      .map((d) => ({
        id: d.id ?? r.id,
        date: toYMD(d.leaveDate ?? d.date ?? ""),
        type,
        status: r.status,
      }))
      .filter((l) => !!l.date);
  });

  // one badge per date
  const byDate = new Map<string, Leave>();
  for (const l of flat) if (!byDate.has(l.date)) byDate.set(l.date, l);
  const unique = Array.from(byDate.values());

  return {
    annualLeave: computeSummary(unique, "ANNUAL", totals.annual),
    casualSickLeave: computeSummary(unique, "CASUAL", totals.casual),
    leaves: unique,
  };
}

export function useLeave() {
  const [leaves, setLeaves] = useState<LeavesData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiLeaveRequest[] | LeavesData>(
        `/leave/requests?userId=${1}`
      );
      const payload = res.data;
      const next: LeavesData = Array.isArray(payload)
        ? normalizeFromRequests(payload)
        : payload?.annualLeave && payload?.leaves
        ? (payload as LeavesData)
        : EMPTY;
      setLeaves(next);
      setError(null);
      console.log("Normalized leaves:", next);
    } catch (err) {
      setError(err);
      setLeaves(EMPTY);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = (date: string, type: LeaveType): Leave => {
    const newLeave: Leave = { id: Date.now(), date, type, status: "PENDING" };
    setLeaves((prev) => {
      const state = prev ?? EMPTY;
      const key = type === "ANNUAL" ? "annualLeave" : "casualSickLeave";
      const summary = { ...state[key] };
      if (summary.available > 0) {
        summary.available -= 1;
        summary.pending += 1;
      }
      return { ...state, [key]: summary, leaves: [...state.leaves, newLeave] };
    });
    return newLeave;
  };

  return { leaves, applyLeave, refetch: fetchLeaves, loading, error };
}
