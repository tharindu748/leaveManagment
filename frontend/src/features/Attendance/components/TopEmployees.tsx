import React from 'react';

interface Employee {
  id: string;
  name: string;
  progress: number;
}

interface TopEmployeesProps {
  employees: Employee[];
  title: string;
}

const TopEmployees: React.FC<TopEmployeesProps> = ({ employees, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <div className="space-y-4">
        {employees.map((employee, index) => (
          <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-3">Q{index + 1}:</span>
              <div>
                <p className="font-medium text-gray-800">{employee.name}</p>
                <p className="text-sm text-gray-600">ID: {employee.id}</p>
              </div>
            </div>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-800 font-medium">{employee.progress}%</span>
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

export default TopEmployees;