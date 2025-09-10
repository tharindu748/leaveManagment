import EmployeeTable from "../components/EmployeeTable";
import FilterComponent from "../components/Filter";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";

export default function AttendancePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employee Attendance</h1>
          <p className="text-gray-500">
            Analys attendance report on employee.
          </p>
        </div>
        <SummaryCards />
        <div className="space-y-4">
          <FilterComponent />
          <EmployeeTable />
        </div>
      </main>
    </div>
  );
}