import React, { useEffect, useState } from "react";
import { useLeave, type LeaveType } from "../hooks/use-leave";
import LeaveCard from "../components/leave-card";
import Calendar from "../components/calendar";
import LeaveSidePanel from "../components/LeaveSidePanel";
import LeaveModal from "../components/leave-model";
import type { OutletContextType } from "@/layouts/main-layout";
import { useOutletContext } from "react-router";

const CalendarLeave: React.FC = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const { leaves, applyLeave } = useLeave();

  // --- States ---
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dayDurations, setDayDurations] = useState<
    Record<string, "full" | "half" | "afternoon">
  >({});

  const [isModalOpen, setModalOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  useEffect(() => {
    setBreadcrumb(["Calendar"]);
  }, [setBreadcrumb]);

  const handleDayClick = (date: Date) => {
    const key = date.toISOString().split("T")[0];

    // Check if leave type is selected in side panel
    const isLeaveTypeSelectedInPanel = leaveType !== "";

    if (!isLeaveTypeSelectedInPanel) {
      // Open modal if no leave type selected
      setClickedDate(date);
      setModalOpen(true);
    } else {
      // Add date to selectedDates if not already added
      if (!selectedDates.some((d) => d.toISOString().split("T")[0] === key)) {
        setSelectedDates([...selectedDates, date]);
        setDayDurations({ ...dayDurations, [key]: "full" });
      } else {
        // Optional: remove date if clicked again
        setSelectedDates(
          selectedDates.filter((d) => d.toISOString().split("T")[0] !== key)
        );
        const copy = { ...dayDurations };
        delete copy[key];
        setDayDurations(copy);
      }
    }
  };

  // --- Side panel leave type change ---
  const handleLeaveTypeChange = (type: LeaveType) => {
    setLeaveType(type);
  };

  // --- Duration change for side panel ---
  const handleDurationChange = (
    date: Date,
    value: "full" | "half" | "afternoon"
  ) => {
    const key = date.toISOString().split("T")[0];
    setDayDurations((prev) => ({ ...prev, [key]: value }));
  };

  // --- Remove a date from side panel ---
  const removeDate = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    setSelectedDates(
      selectedDates.filter((d) => d.toISOString().split("T")[0] !== key)
    );
    const copy = { ...dayDurations };
    delete copy[key];
    setDayDurations(copy);
  };

  // --- Apply leave from modal ---
  const handleApplyLeaveFromModal = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    applyLeave(key, leaveType);
    setClickedDate(null);
    setModalOpen(false);
  };

  // --- Apply leave from side panel for multiple dates ---
  const handleApplyLeaveFromSidePanel = () => {
    selectedDates.forEach((d) =>
      applyLeave(d.toISOString().split("T")[0], leaveType)
    );
    setSelectedDates([]);
    setDayDurations({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* --- Leave summary cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        {/* --- Main layout --- */}
        <div className="flex flex-row gap-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Left: Calendar */}
          <div className="md:col-span-3">
            <Calendar
              onDayClick={handleDayClick}
              leaves={leaves.leaves}
              selectedDates={selectedDates}
            />
          </div>

          {/* Right: Side Panel */}
          <div className="md:col-span-1">
            <LeaveSidePanel
              leaveType={leaveType}
              setLeaveType={handleLeaveTypeChange} // only changes type
              selectedDates={selectedDates}
              dayDurations={dayDurations}
              handleDurationChange={handleDurationChange}
              handleApplyLeave={handleApplyLeaveFromSidePanel}
              removeDate={removeDate}
            />
          </div>
        </div>
      </div>

      {/* --- Modal for quick leave apply --- */}
      <LeaveModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        selectedDate={clickedDate}
        leaveType={leaveType}
        onApplyLeave={handleApplyLeaveFromModal}
      />
    </div>
  );
};

export default CalendarLeave;
