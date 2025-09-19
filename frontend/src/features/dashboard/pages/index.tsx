import { DataTable2 } from "@/components/data-table";
import StatCard from "../components/card";
import { columns, type LeaveRequest } from "../components/Table/column";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import type { OutletContextType } from "@/layouts/main-layout";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import BarChart from "../components/bar-chart";
import api from "@/api/axios";

// 🆕 shadcn + icons + date-fns
import { CalendarIcon } from "lucide-react";
import { format as formatDateFns } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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

type StatCardProps = {
  title: string;
  percentage: number;
  count: number;
  color?: string;
};

// Helper: YYYY-MM-DD for API
const toYMD = (d: Date) => formatDateFns(d, "yyyy-MM-dd");

const Dashboard = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [mostData, setMostData] = useState<LeaveRequest[]>([]);
  const [leastData, setLeastData] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState<StatCardProps[]>([]);

  // 🆕 date state (default today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const apiDate = useMemo(() => toYMD(selectedDate), [selectedDate]);

  const fetchMostLate = async () => {
    try {
      const res = await api.get("/reports/most-most-employees");
      setMostData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLeastLate = async () => {
    try {
      const res = await api.get("/reports/most-late-employees");
      setLeastData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSummary = async (dateStr: string) => {
    try {
      const res = await api.get(`/reports/summary?date=${dateStr}`);
      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

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

  // Initial load
  useEffect(() => {
    setBreadcrumb(["Dashboard"]);
    fetchMostLate();
    fetchLeastLate();
  }, []);

  // 🆕 re-fetch summary whenever date changes
  useEffect(() => {
    fetchSummary(apiDate);
  }, [apiDate]);

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-4">
          <PageHeaderTitle value="Dashboard" />
        </div>
      </PageHeader>

      <div className="min-h-screen p-6">
        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {formatDateFns(selectedDate, "EEEE, dd/MM/yyyy")}
            </h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[220px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateFns(selectedDate, "EEE, dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  // optional: block future days
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {summary.map((item, i) => (
                  <StatCard
                    key={i}
                    title={item.title}
                    percentage={item.percentage}
                    count={item.count}
                    color={item.color}
                  />
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="rounded-lg border p-6 mt-3 flex-1">
                  <BarChart />
                </div>
                <div className="rounded-lg border p-6 mt-3 flex-1">
                  <BarChart />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-6 mt-3">
                  <h2 className="mb-4 font-semibold">Most Lates</h2>
                  <DataTable2 columns={columns} data={mostData} />
                </div>

                <div className="rounded-lg border p-6 mt-3">
                  <h2 className="mb-4 font-semibold">Least Lates</h2>
                  <DataTable2 columns={columns} data={leastData} />
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
