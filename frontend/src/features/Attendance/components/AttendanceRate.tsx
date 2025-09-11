import React, { useState } from "react";

interface MonthlyRate {
  month: string;
  rate: number;
}

interface AttendanceRateProps {
  employeeName: string;
  yearlyRate: number;
  monthlyRates: MonthlyRate[];
  availableYears: number[]; // List of years to filter
}

const AttendanceRate: React.FC<AttendanceRateProps> = ({
  employeeName,
  yearlyRate,
  monthlyRates,
  availableYears,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const maxRate = 100;

  // Function to determine bar color based on rate
  const getBarColor = (rate: number) => {
    if (rate >= 90) return "#16a34a"; // Green
    if (rate >= 70) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Rate - {employeeName}</h2>

      {/* Year Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="font-medium text-gray-700">Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Yearly Rate */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">This Year</h3>
        <div className="bg-blue-50 p-4 rounded-lg flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="h-4 rounded-full"
              style={{ width: `${yearlyRate}%`, backgroundColor: "#3B82F6" }}
            ></div>
          </div>
          <p className="text-2xl font-bold text-blue-700">{yearlyRate}%</p>
        </div>
      </div>

      {/* Vertical Monthly Bar Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Rate</h3>
        <div className="flex items-end justify-between h-60 space-x-2">
          {monthlyRates.map((monthly, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-8 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(monthly.rate / maxRate) * 100}%`,
                  backgroundColor: getBarColor(monthly.rate),
                }}
                title={`${monthly.rate}%`}
              ></div>
              <span className="mt-2 text-sm text-gray-700">{monthly.month}</span>
              <span className="text-xs text-gray-600">{monthly.rate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceRate;
