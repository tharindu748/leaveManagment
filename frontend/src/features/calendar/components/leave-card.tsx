import React from "react";

interface LeaveCardProps {
  title: string;
  total: number;
  available: number;
  // Tailwind color class for the number (e.g., "text-green-500")
  color?: string;
}

const LeaveCard: React.FC<LeaveCardProps> = ({
  title,
  total,
  available,
  color = "text-green-500",
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow p-4"
      aria-label={`${title} summary`}
    >
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">TOTAL = {total}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{available} d</p>
        <p className="text-sm text-gray-600 mt-1">AVAILABLE</p>
      </div>
    </div>
  );
};

export default LeaveCard;
