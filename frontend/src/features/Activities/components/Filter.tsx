import { useState } from "react";

export default function FilterComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-08");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side - Search */}
        <div className="flex-1 min-w-[250px] max-w-md">
           {/* You can add a search here if needed, or remove this div */}
        </div>

        {/* Right side - Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}