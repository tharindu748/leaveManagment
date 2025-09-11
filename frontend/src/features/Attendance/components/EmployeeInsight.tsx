import React from 'react';

interface EmployeeInsightProps {
  employeeName: string;
  insight: string;
}

const EmployeeInsight: React.FC<EmployeeInsightProps> = ({ employeeName, insight }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-6 mt-6">
      <p className="text-blue-800">
        <span className="font-semibold">{employeeName}'s</span> {insight}
      </p>
    </div>
  );
};

export default EmployeeInsight;