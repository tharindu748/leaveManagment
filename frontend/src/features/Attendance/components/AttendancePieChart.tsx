import React from 'react';

interface AttendancePieChartProps {
  stats: {
    present: number;
    late: number;
    undertime: number;
    absent: number;
  };
}

const AttendancePieChart: React.FC<AttendancePieChartProps> = ({ stats }) => {
  const total = stats.present + stats.late + stats.undertime + stats.absent;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Distribution</h2>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative w-40 h-40 mb-4 md:mb-0 md:mr-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Present */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeDasharray={`${(stats.present / total) * 251.2} 251.2`}
              transform="rotate(-90 50 50)"
            />
            {/* Late */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#eab308"
              strokeWidth="20"
              strokeDasharray={`${(stats.late / total) * 251.2} 251.2`}
              strokeDashoffset={`-${(stats.present / total) * 251.2}`}
              transform="rotate(-90 50 50)"
            />
            {/* Undertime */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f97316"
              strokeWidth="20"
              strokeDasharray={`${(stats.undertime / total) * 251.2} 251.2`}
              strokeDashoffset={`-${((stats.present + stats.late) / total) * 251.2}`}
              transform="rotate(-90 50 50)"
            />
            {/* Absent */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${(stats.absent / total) * 251.2} 251.2`}
              strokeDashoffset={`-${((stats.present + stats.late + stats.undertime) / total) * 251.2}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">{Math.round((stats.present / total) * 100)}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Present: {stats.present} days</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Late: {stats.late} days</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span className="text-sm">Undertime: {stats.undertime} days</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Absent: {stats.absent} days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePieChart;