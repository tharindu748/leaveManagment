import React from 'react';

interface Employee {
  id: string;
  name: string;
  progress: number;
}

interface PerformanceChartProps {
  employees: Employee[];
  title: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ employees, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <div className="space-y-4">
        {employees.map((employee, index) => (
          <div key={employee.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-3">Q{index + 1}:</span>
                <div>
                  <p className="font-medium text-gray-800">{employee.name}</p>
                  <p className="text-sm text-gray-600">ID: {employee.id}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-800">{employee.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${employee.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Number: {employees.length}</p>
        <p>Name: Top Performers</p>
        <p>ID: Progress</p>
      </div>
    </div>
  );
};

export default PerformanceChart;