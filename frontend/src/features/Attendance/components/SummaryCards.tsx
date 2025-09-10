import React from "react";

interface SummaryCardsProps {
  employeeName: string;
  stats: {
    present: number;
    late: number;
    undertime: number;
    absent: number;
  };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ employeeName, stats }) => {
  // Find the maximum value to scale the bars
  const maxValue = Math.max(stats.present, stats.late, stats.undertime, stats.absent, 1);

  const barData = [
    { label: "Present", value: stats.present, color: "bg-blue-500" },
    { label: "Late", value: stats.late, color: "bg-yellow-500" },
    { label: "Undertime", value: stats.undertime, color: "bg-orange-500" },
    { label: "Absent", value: stats.absent, color: "bg-red-500" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Summary - {employeeName}</h2>

      <div className="flex items-end justify-between h-60 space-x-4">
        {barData.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center w-16">
            {/* Bar */}
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ${item.color}`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`${item.value}`}
            ></div>
            {/* Label */}
            <span className="mt-2 text-sm font-medium text-gray-700">{item.label}</span>
            {/* Value */}
            <span className="text-sm text-gray-600">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
