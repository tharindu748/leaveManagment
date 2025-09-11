import React from "react";

interface EmployeeDetailsProps {
  employee: {
    name: string;
    id: string;
    number: string;
    email: string;
    address: string;
    avatar?: string; // optional profile picture
  };
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Employee Details</h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-6">
        {/* Profile Picture */}
        <img
          src={employee.avatar || "https://i.pravatar.cc/100"}
          alt={employee.name}
          className="w-24 h-24 rounded-full border object-cover"
        />

        {/* Employee Info */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-gray-700">{employee.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-gray-700">
            <p>
              <span className="font-medium">ID:</span> {employee.id}
            </p>
            <p>
              <span className="font-medium">Number:</span> {employee.number}
            </p>
            <p>
              <span className="font-medium">Email:</span> {employee.email}
            </p>
            <p>
              <span className="font-medium">Address:</span> {employee.address}
            </p>
          </div>
        </div>
      </div>

      {/* Work Days */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Work Days</h3>
        <p className="text-gray-600 mb-4">Work days for Monthly</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">13</p>
            <p className="text-sm text-gray-600">Days Present</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-700">7</p>
            <p className="text-sm text-gray-600">Late Arrivals</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-700">1</p>
            <p className="text-sm text-gray-600">Early Departures</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-700">2</p>
            <p className="text-sm text-gray-600">Days Absent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
