import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Hash,
} from "lucide-react";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import type { OutletContextType } from "@/layouts/main-layout";
import { useOutletContext } from "react-router";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  epfNo: string;
  image: string;
  workedSinceJoining: number;
  totalLeaveCount: number;
  leaveTaken: {
    sick: number;
    annual: number;
  };
  remainingHolidays: number;
  workHoursThisMonth: number;
}

const EmployeeDashboard: React.FC = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [employee] = useState<Employee>({
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    position: "Software Developer",
    epfNo: "EPF123456",
    image: "/api/placeholder/120/120",
    workedSinceJoining: 245,
    totalLeaveCount: 25,
    leaveTaken: {
      sick: 10,
      annual: 12,
    },
    remainingHolidays: 8,
    workHoursThisMonth: 168,
  });

  useEffect(() => {
    setBreadcrumb(["Dashboard"]);
  }, []);

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-4">
          <PageHeaderTitle value="Dashboard" />
        </div>
      </PageHeader>
      <div className="bg-gray-50 p-6">
        <div className="mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Profile Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-red-200">
                  <User className="w-12 h-12 text-gray-500" />
                  <span className="text-xs text-red-500 ml-1">Image</span>
                </div>

                <div className="w-full space-y-3">
                  <div className="border border-red-200 rounded p-3">
                    <div className="flex items-center text-gray-700">
                      <User className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        Name
                      </span>
                    </div>
                    <p className="mt-1 font-semibold">{employee.name}</p>
                  </div>

                  <div className="border border-red-200 rounded p-3">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        Email
                      </span>
                    </div>
                    <p className="mt-1">{employee.email}</p>
                  </div>

                  <div className="border border-red-200 rounded p-3">
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        Phone
                      </span>
                    </div>
                    <p className="mt-1">{employee.phone}</p>
                  </div>

                  <div className="border border-red-200 rounded p-3">
                    <div className="flex items-center text-gray-700">
                      <Briefcase className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        Position
                      </span>
                    </div>
                    <p className="mt-1">{employee.position}</p>
                  </div>

                  <div className="border border-red-200 rounded p-3">
                    <div className="flex items-center text-gray-700">
                      <Hash className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        EPF No
                      </span>
                    </div>
                    <p className="mt-1">{employee.epfNo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Leave Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Worked Since Joining */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 mr-2 text-red-500" />
                  <h2 className="text-lg font-semibold text-red-500">
                    Worked Since Joining
                  </h2>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {employee.workedSinceJoining}{" "}
                  <span className="text-lg font-normal text-gray-600">
                    days
                  </span>
                </div>
              </div>

              {/* Total Leave Count */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  <h2 className="text-lg font-semibold text-red-500">
                    Total Leave Count
                  </h2>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {employee.totalLeaveCount}{" "}
                  <span className="text-lg font-normal text-gray-600">
                    days
                  </span>
                </div>
              </div>

              {/* Leave Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leave Taken */}
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                  <h3 className="text-lg font-semibold text-red-500 mb-4">
                    Leave Taken
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-red-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-medium">Sick</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {employee.leaveTaken.sick}
                        </span>
                      </div>
                    </div>
                    <div className="border border-red-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-medium">Annual</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {employee.leaveTaken.annual}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remaining Holidays and Work Hours */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                    <h3 className="text-lg font-semibold text-red-500 mb-2">
                      Remaining Holidays
                    </h3>
                    <div className="text-2xl font-bold text-gray-900">
                      {employee.remainingHolidays}{" "}
                      <span className="text-sm font-normal text-gray-600">
                        days
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                    <h3 className="text-lg font-semibold text-red-500 mb-2">
                      This Month Work Hours (Total)
                    </h3>
                    <div className="text-2xl font-bold text-gray-900">
                      {employee.workHoursThisMonth}{" "}
                      <span className="text-sm font-normal text-gray-600">
                        hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
