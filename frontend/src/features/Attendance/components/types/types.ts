export type Mode = "day" | "month";

export type DayRow = {
  employee: string;
  start: string | null;
  lastOut: string | null;
  workedSeconds: number;
  notWorkingSeconds: number;
  overtimeSeconds: number;
};

export type MonthRow = {
  employee: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
};

export type AttendanceMonthResponse = {
  month: string; // YYYY-MM
  timezone: string;
  employees: {
    id: string;
    name: string;
    records: {
      date: string; // YYYY-MM-DD
      start: string | null; // HH:mm or null
      lastOut: string | null;
      workedSeconds: number;
      notWorkingSeconds: number;
      overtimeSeconds: number;
    }[];
  }[];
};

export type AttendanceDayResponse = {
  date: string; // YYYY-MM-DD
  timezone: string;
  employees: {
    id: string;
    name: string;
    start: string | null;
    lastOut: string | null;
    workedSeconds: number;
    notWorkingSeconds: number;
    overtimeSeconds: number;
  }[];
};
