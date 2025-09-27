import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export type LeaveType = "ANNUAL" | "CASUAL";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Leave {
  id: number;
  date: string;
  type: LeaveType;
  status: LeaveStatus;
  isHalfDay: boolean;
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  dates: ApiLeaveDate[];
};

// ---- utils ----
const toYMD = (s: string) => (s ?? "").slice(0, 10);

const computeSummary = (
  _flat: Leave[],
  _type: LeaveType,
  used: number,
  pending: number,
  balance: number
): LeaveSummary => {
  const total = used + balance;
  const available = Math.max(balance - pending, 0);
  return { total, used, pending, available };
};

function normalizeFromRequests(rows: ApiLeaveRequest[]): {
  flat: Leave[];
  usedAnnual: number;
  pendingAnnual: number;
  usedCasual: number;
  pendingCasual: number;
} {
  const flat: Leave[] = rows.flatMap((r) => {
    const type: LeaveType = r.leaveType === "ANNUAL" ? "ANNUAL" : "CASUAL";
    return (r.dates ?? [])
      .map((d) => ({
        id: d.id ?? r.id,
        date: toYMD(d.leaveDate ?? d.date ?? ""),
        type,
        status: r.status as LeaveStatus,
        isHalfDay: d.isHalfDay ?? false,
      }))
      .filter((l) => !!l.date);
  });

  const usedAnnual = flat
    .filter((l) => l.type === "ANNUAL" && l.status === "APPROVED")
    .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : 1), 0);

  const pendingAnnual = flat
    .filter((l) => l.type === "ANNUAL" && l.status === "PENDING")
    .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : 1), 0);

  const usedCasual = flat
    .filter((l) => l.type === "CASUAL" && l.status === "APPROVED")
    .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : 1), 0);

  const pendingCasual = flat
    .filter((l) => l.type === "CASUAL" && l.status === "PENDING")
    .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : 1), 0);

  return { flat, usedAnnual, pendingAnnual, usedCasual, pendingCasual };
}

export function useLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeavesData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const year = new Date().getFullYear();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const [requestsRes, annualBalanceRes, casualBalanceRes] =
        await Promise.all([
          api.get<ApiLeaveRequest[] | LeavesData>(
            `/leave/requests?userId=${user?.id}`
          ),
          api.get(`/leave/balance/${user?.id}/${year}/ANNUAL`),
          api.get(`/leave/balance/${user?.id}/${year}/CASUAL`),
        ]);

      const payload = requestsRes.data;
      const { flat, usedAnnual, pendingAnnual, usedCasual, pendingCasual } =
        Array.isArray(payload)
          ? normalizeFromRequests(payload)
          : {
              flat: [],
              usedAnnual: 0,
              pendingAnnual: 0,
              usedCasual: 0,
              pendingCasual: 0,
            };

      const annualBalance = annualBalanceRes.data.balance ?? 0;
      const casualBalance = casualBalanceRes.data.balance ?? 0;

      const annualSummary = computeSummary(
        flat,
        "ANNUAL",
        usedAnnual,
        pendingAnnual,
        annualBalance
      );
      const casualSummary = computeSummary(
        flat,
        "CASUAL",
        usedCasual,
        pendingCasual,
        casualBalance
      );

      const next: LeavesData = {
        annualLeave: annualSummary,
        casualSickLeave: casualSummary,
        leaves: flat,
      };

      setLeaves(next);
      setError(null);
      console.log("Normalized leaves:", next);
    } catch (err: any) {
      setError(err);
      setLeaves(EMPTY);
      toast.error(err?.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = (
    newLeaves: Leave[],
    type: LeaveType,
    deduction: number
  ) => {
    setLeaves((prev) => {
      const updatedLeaves = [...prev.leaves, ...newLeaves];
      const key = type === "ANNUAL" ? "annualLeave" : "casualSickLeave";
      const summary = { ...prev[key] };
      summary.pending += deduction;
      summary.available = Math.max(summary.available - deduction, 0);
      return { ...prev, [key]: summary, leaves: updatedLeaves };
    });
  };

  return { leaves, applyLeave, refetch: fetchLeaves, loading, error };
}
