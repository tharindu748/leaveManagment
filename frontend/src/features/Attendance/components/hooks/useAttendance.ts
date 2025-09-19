import { useEffect, useState } from "react";
import api from "@/api/axios";
import type {
  AttendanceDayResponse,
  AttendanceMonthResponse,
  Mode,
} from "../types/types";

export function useAttendance(
  mode: Mode,
  selectedDate: string,
  selectedMonth: string,
  tz = "Asia/Colombo"
) {
  const [monthData, setMonthData] = useState<AttendanceMonthResponse | null>(
    null
  );
  const [dayData, setDayData] = useState<AttendanceDayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function fetchMonth() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AttendanceMonthResponse>(
          "/attendance/records",
          {
            params: { month: selectedMonth, tz },
          }
        );
        if (!cancel) setMonthData(res.data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to load month data");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    if (mode === "month") fetchMonth();
    return () => {
      cancel = true;
    };
  }, [mode, selectedMonth, tz]);

  useEffect(() => {
    let cancel = false;
    async function fetchDay() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AttendanceDayResponse>("/attendance/day", {
          params: { date: selectedDate, tz },
        });
        if (!cancel) setDayData(res.data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to load day data");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    if (mode === "day") fetchDay();
    return () => {
      cancel = true;
    };
  }, [mode, selectedDate, tz]);

  return { monthData, dayData, loading, error };
}
