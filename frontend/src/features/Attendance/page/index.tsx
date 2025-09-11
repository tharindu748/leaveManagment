import React from 'react';
import EmployeeDetails from '../components/EmployeeDetails';
import AttendanceChart from '../components/AttendanceChart';
import SummaryCards from '../components/SummaryCards';
import PerformanceChart from '../components/PerformanceChart';
import EmployeeInsight from '../components/EmployeeInsight';
import AttendancePieChart from '../components/AttendancePieChart';

const EmployeeManagement: React.FC = () => {
  // Sample data
  const employee = {
    name: "Caleb White",
    id: "2021-0001",
    number: "(555) 123-4567",
    email: "caleb.white@gmail.com",
    address: "123 Elm Street"
  };

  const monthlyRates = [
    { month: "January", rate: 57 },
    { month: "February", rate: 72 },
    { month: "March", rate: 65 },
    { month: "April", rate: 88 },
    { month: "May", rate: 92 },
    { month: "June", rate: 85 }
  ];

  const stats = {
    present: 13,
    late: 7,
    undertime: 1,
    absent: 2
  };

  const topEmployees = [
    { id: "2020-4535", name: "Daxton Farmer", progress: 91 },
    { id: "2017-4718", name: "Todd Dye", progress: 91 },
    { id: "2017-4723", name: "Julia Willis", progress: 90 },
    { id: "2019-1234", name: "Michael Chen", progress: 89 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">my profile </h1>
          <p className="text-gray-600 mt-2">Detailed view of employee attendance and performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EmployeeDetails employee={employee} />
            <AttendanceChart monthlyRates={monthlyRates} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SummaryCards employeeName={employee.name} stats={stats} />
            <AttendancePieChart stats={stats} />
            <PerformanceChart employees={topEmployees} title="Top Performing Employees" />
          </div>
        </div>

        <EmployeeInsight 
          employeeName={employee.name}
          insight="monthly attendance rate highlights consistent commitment to work schedule."
        />
      </div>
    </div>
  );
};

export default EmployeeManagement;