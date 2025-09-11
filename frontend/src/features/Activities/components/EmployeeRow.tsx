interface DayStatus {
  day: string;
  value: string;
  status: "present" | "late" | "leave" | "active" | "absent";
}

interface EmployeeRowProps {
  avatar: string;
  name: string;
  role: string;
  week: DayStatus[];
}

// A map for status styles to make the component cleaner
const statusClasses = {
  leave: "bg-purple-100 text-purple-600",
  late: "bg-orange-100 text-orange-600",
  active: "bg-green-100 text-green-600",
  absent: "bg-red-100 text-red-600",
  present: "bg-gray-100 text-gray-600",
};

export default function EmployeeRow({ avatar, name, role, week }: EmployeeRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 flex items-center gap-3">
        <img src={avatar} alt={`${name}'s avatar`} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-medium text-gray-800">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </td>
      {week.map((day, idx) => (
        <td key={idx} className="p-4 whitespace-nowrap">
          <span
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusClasses[day.status] || statusClasses.present
            }`}
          >
            {day.value}
          </span>
        </td>
      ))}
    </tr>
  );
}