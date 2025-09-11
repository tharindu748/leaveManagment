import EmployeeRow from "./EmployeeRow";

const employees = [
  {
    name: "Dianne Russell",
    role: "UI/UX Designer",
    avatar: "https://i.pravatar.cc/50?img=1",
    week: [
      { day: "Sun", value: "8 Hours", status: "present" },
      { day: "Mon", value: "4h 36m", status: "late" },
      { day: "Tue", value: "Leave", status: "leave" },
      { day: "Wed", value: "8h 39m", status: "present" },
      { day: "Thu", value: "Active", status: "active" },
      { day: "Fri", value: "-", status: "absent" },
      { day: "Sat", value: "-", status: "present" },
    ],
  },
  // Add more employees...
];

// Define the correct order of the week
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EmployeeTable() {
  return (
    // Wrapper div to enable horizontal scrolling on small screens
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Employee</th>
              {/* Dynamically generate headers to ensure correct order */}
              {daysOfWeek.map((day) => (
                <th key={day} className="p-4">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp, idx) => {
              // Sort the week data to match the header order before passing it
              const sortedWeek = [...emp.week].sort(
                (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
              );
              return <EmployeeRow key={idx} {...emp} week={sortedWeek} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}