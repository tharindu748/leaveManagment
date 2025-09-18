import { DataTable2 } from "@/components/data-table";
import StatCard from "../components/card";
import { columns, type LeaveRequest } from "../components/Table/column";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import type { OutletContextType } from "@/layouts/main-layout";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import BarChart from "../components/bar-chart";

interface AttendanceCard {
  title: string;
  percentage: number;
  count: number;
  color: string;
}

interface Employee {
  id: number;
  name: string;
  avatar: string;
  department?: string;
  late?: number;
  workingDays?: number;
  invoiceNumber?: string;
  time?: string;
  status?: string;
}

const Dashboard = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<LeaveRequest[]>([]);

  const mostLates: Employee[] = [
    {
      id: 1,
      name: "Md Ashid Ibrahim",
      avatar: "/api/placeholder/40/40",
      late: 6,
      workingDays: 6,
    },
    {
      id: 2,
      name: "MD Saikur Rahman",
      avatar: "/api/placeholder/40/40",
      late: 6,
      workingDays: 6,
    },
  ];

  const leastLates: Employee[] = [
    {
      id: 1,
      name: "Shahasada Islam",
      avatar: "/api/placeholder/40/40",
      late: 0,
      workingDays: 6,
    },
    {
      id: 2,
      name: "Md Adnan",
      avatar: "/api/placeholder/40/40",
      late: 0,
      workingDays: 4,
    },
  ];

  const attendanceFeed: Employee[] = [
    {
      id: 1,
      name: "Asif Aminur Rashid",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "R&D OUT (20087)",
      time: "12:25PM",
    },
    {
      id: 2,
      name: "Syed Md. Mohaimen Mehtab Samir",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "Invoice HQ (20099)",
      time: "12:16PM",
    },
    {
      id: 3,
      name: "Shahasada Islam",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "Invoice Production (9003)",
      time: "12:14PM",
    },
    {
      id: 4,
      name: "Minhaz Khan",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "R&D IN (20088)",
      time: "12:12PM",
    },
    {
      id: 5,
      name: "Abdullah Ebne Sakib",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "Invoice Production (9002)",
      time: "12:12PM",
    },
    {
      id: 6,
      name: "Abdullah Ebne Sakib",
      avatar: "/api/placeholder/40/40",
      department: "Face",
      status: "Without mask",
      invoiceNumber: "Invoice HQ (20077)",
      time: "12:11PM",
    },
    {
      id: 7,
      name: "Fazle Rabbi Shovon",
      avatar: "/api/placeholder/40/40",
      department: "Fingerprint",
      invoiceNumber: "Invoice Production (9001)",
      time: "12:10PM",
    },
  ];

  useEffect(() => {
    setBreadcrumb(["Dashboard"]);
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Dashboard" />
        </div>
      </PageHeader>
      <div className="min-h-screen p-6">
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Monday, 07/06/2021</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Present"
                  percentage={85}
                  count={120}
                  color="text-green-600"
                />
                <StatCard
                  title="Absent"
                  percentage={10}
                  count={15}
                  color="text-red-600"
                />
                <StatCard
                  title="On Time"
                  percentage={70}
                  count={100}
                  color="text-blue-600"
                />
                <StatCard
                  title="Late"
                  percentage={15}
                  count={20}
                  color="text-yellow-600"
                />
              </div>
              <div className="flex justify-between mb-6">
                <div className="rounded-lg border p-6 mt-3">
                  <BarChart />
                </div>
                <div className="rounded-lg border p-6 mt-3">
                  <BarChart />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-6 mt-3">
                  <h2 className="mb-4 font-semibold">Most Lates</h2>
                  <DataTable2 columns={columns} data={data} />
                </div>

                <div className="rounded-lg border p-6 mt-3">
                  <h2 className="mb-4 font-semibold">Least Lates</h2>
                  <DataTable2 columns={columns} data={data} />
                </div>
              </div>
            </div>

            {/* Attendance Feed */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="mb-4 font-semibold">Attendance Feed</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceFeed.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {entry.name}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{entry.department}</span>
                          {entry.status && (
                            <span className="text-red-500 font-medium">
                              {entry.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {entry.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          Today {entry.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
