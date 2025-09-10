import React, { useState } from "react";

interface MonthlyRate {
  month: string;
  rate: number;
}

interface AttendanceChartProps {
  employeeName: string;
  yearlyRate: number;
  monthlyRates: MonthlyRate[];
  availableYears?: number[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({
  employeeName,
  yearlyRate,
  monthlyRates,
  availableYears = [new Date().getFullYear()],
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const maxBarHeight = 160; // Maximum height for bars in pixels

  // All month names
  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Create a complete dataset with all months, filling in missing months with 0 rate
  const completeMonthlyRates = allMonths.map(month => {
    const foundMonth = monthlyRates.find(m => m.month === month);
    return foundMonth ? foundMonth : { month, rate: 0 };
  });

  // Determine bar color based on rate
  const getBarColor = (rate: number) => {
    if (rate === 0) return "#9ca3af"; // Gray for no data
    if (rate >= 90) return "#16a34a"; // Green
    if (rate >= 70) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  // Get bar label based on rate
  const getBarLabel = (rate: number) => {
    return rate === 0 ? "No data" : `${rate}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Attendance Rate - {employeeName}
      </h2>

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
              className="h-4 rounded-full transition-all duration-500"
              style={{ width: `${yearlyRate}%`, backgroundColor: "#3B82F6" }}
            ></div>
          </div>
          <p className="text-2xl font-bold text-blue-700">{yearlyRate}%</p>
        </div>
      </div>

      {/* Vertical Monthly Column Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Rate</h3>
        <div className="flex items-end justify-between h-60 space-x-1 px-2 overflow-x-auto">
          {completeMonthlyRates.map((monthly, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-[40px]">
              <div className="flex flex-col items-center justify-end h-40 mb-2">
                <div
                  className="w-8 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                  style={{
                    height: monthly.rate > 0 ? `${(monthly.rate / 100) * maxBarHeight}px` : "4px",
                    backgroundColor: getBarColor(monthly.rate),
                  }}
                  title={`${monthly.month}: ${getBarLabel(monthly.rate)}`}
                >
                  {monthly.rate > 0 && (
                    <div className="text-white text-xs font-bold flex items-center justify-center h-full">
                      {monthly.rate > 20 && `${monthly.rate}%`}
                    </div>
                  )}
                </div>
              </div>
              <span className="mt-2 text-xs text-gray-700 text-center">
                {monthly.month.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span className="text-xs text-gray-600">90%+ (Excellent)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">70-89% (Good)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">Below 70% (Needs Improvement)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span className="text-xs text-gray-600">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;