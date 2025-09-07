import { useEffect, useState } from "react";
import { useLeave } from "../hooks/use-leave";
import LeaveCard from "../components/leave-card";
import LeaveModal from "../components/leave-model";
import Calendar from "../components/calendar";
import { useOutletContext } from "react-router";
import type { OutletContextType } from "@/layouts/main-layout";

interface LeaveType {
  id: number;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface LeaveSummary {
  total: number;
  available: number;
}

interface Leaves {
  annualLeave: LeaveSummary;
  casualSickLeave: LeaveSummary;
  leaves: LeaveType[];
}

const CalendarLeave: React.FC = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { leaves, applyLeave } = useLeave() as {
    leaves: Leaves;
    applyLeave: (date: string, type: "annual" | "sick") => void;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleApplyLeave = (date: Date | null, type: "annual" | "sick") => {
    if (!date) return;
    const dateStr = date.toISOString().split("T")[0];
    applyLeave(dateStr, type);
  };

  useEffect(() => {
    setBreadcrumb(["Calendar"]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeaveCard
            title="ANNUAL LEAVE"
            total={leaves.annualLeave.total}
            available={leaves.annualLeave.available}
            color="text-leave-blue"
          />
          <LeaveCard
            title="CASUAL & SICK LEAVE"
            total={leaves.casualSickLeave.total}
            available={leaves.casualSickLeave.available}
            color="text-leave-cyan"
          />
        </div>

        <Calendar onDayClick={handleDayClick} leaves={leaves.leaves} />

        <LeaveModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          selectedDate={selectedDate}
          onApplyLeave={handleApplyLeave}
        />
      </div>
    </div>
  );
};

export default CalendarLeave;
