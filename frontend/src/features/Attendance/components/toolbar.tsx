import type { Mode } from "./types/types";

type Props = {
  mode: Mode;
  setMode: (m: Mode) => void;
  selectedDate: string;
  setSelectedDate: (s: string) => void;
  selectedMonth: string;
  setSelectedMonth: (s: string) => void;
  search: string;
  setSearch: (s: string) => void;
};

export default function Toolbar({
  mode,
  setMode,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <fieldset className="flex items-center gap-2 rounded-xl border px-3 py-2">
        <legend className="mr-2 text-xs uppercase tracking-wide text-gray-500">
          View
        </legend>
        <label className="inline-flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="mode"
            className="accent-black"
            checked={mode === "day"}
            onChange={() => setMode("day")}
          />
          Day
        </label>
        <label className="inline-flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="mode"
            className="accent-black"
            checked={mode === "month"}
            onChange={() => setMode("month")}
          />
          Month
        </label>
      </fieldset>

      {mode === "day" ? (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Date</span>
          <input
            type="date"
            className="rounded-lg border px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      ) : (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Month</span>
          <input
            type="month"
            className="rounded-lg border px-3 py-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </label>
      )}

      <input
        type="search"
        placeholder="Search employee..."
        className="rounded-lg border px-3 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
