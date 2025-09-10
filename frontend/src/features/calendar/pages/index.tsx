import React, { useEffect, useState } from "react";
import { useLeave, type LeaveType } from "../hooks/use-leave";
import LeaveCard from "../components/leave-card";

import LeaveSidePanel from "../components/LeaveSidePanel";
import LeaveModal from "../components/leave-model";
import type { OutletContextType } from "@/layouts/main-layout";
import { useOutletContext } from "react-router";
import api from "@/api/axios";
import Calendar from "../components/calendar";

type DayDuration = "FULL" | "MORNING" | "AFTERNOON";

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const CalendarLeave: React.FC = () => {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const { leaves, applyLeave } = useLeave();

  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dayDurations, setDayDurations] = useState<Record<string, DayDuration>>(
    {}
  );

  const [isModalOpen, setModalOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  useEffect(() => {
    setBreadcrumb(["Calendar"]);
  }, [setBreadcrumb]);

  const handleDayClick = (date: Date) => {
    const key = formatDate(date);

    const isLeaveTypeSelectedInPanel = !!leaveType;

    if (!isLeaveTypeSelectedInPanel) {
      setClickedDate(date);
      setModalOpen(true);
    } else {
      if (!selectedDates.some((d) => formatDate(d) === key)) {
        setSelectedDates([...selectedDates, date]);
        setDayDurations({ ...dayDurations, [key]: "FULL" });
      } else {
        setSelectedDates(selectedDates.filter((d) => formatDate(d) !== key));
        const copy = { ...dayDurations };
        delete copy[key];
        setDayDurations(copy);
      }
    }
  };

  const handleLeaveTypeChange = (type: LeaveType | "") => {
    setLeaveType(type);
  };

  const handleDurationChange = (date: Date, value: DayDuration) => {
    const key = formatDate(date);
    setDayDurations((prev) => ({ ...prev, [key]: value }));
  };

  const removeDate = (date: Date) => {
    const key = formatDate(date);
    setSelectedDates(selectedDates.filter((d) => formatDate(d) !== key));
    const copy = { ...dayDurations };
    delete copy[key];
    setDayDurations(copy);
  };

  const submitLeave = async (
    dates: Date[],
    type: LeaveType,
    reason: string,
    durationsMap: Record<string, DayDuration>
  ) => {
    const datesPayload = dates.map((d) => {
      const key = formatDate(d);
      const duration = durationsMap[key] ?? "FULL";
      return {
        date: key,
        isHalfDay: duration !== "FULL",
        halfDayType:
          duration === "MORNING"
            ? "MORNING"
            : duration === "AFTERNOON"
            ? "AFTERNOON"
            : null,
      };
    });

    const body = {
      userId: 1,
      approvedBy: null,
      leaveType: type,
      reason: reason || null,
      dates: datesPayload,
    };

    const res = await api.post("/leave/request", body);

    datesPayload.forEach(({ date }) => applyLeave(date, type));

    return res.data;
  };

  // --- Modal apply (single date) ---
  const handleApplyLeaveFromModal = async (
    date: Date | null,
    type: LeaveType,
    duration: DayDuration,
    reason: string
  ) => {
    if (!date) return;
    await submitLeave([date], type, reason, { [formatDate(date)]: duration });
    setClickedDate(null);
    setModalOpen(false);
  };

  // --- Side panel apply (multiple dates) ---
  const handleApplyLeaveFromSidePanel = async (reason: string) => {
    if (!leaveType) return; // user chose "Select Leave type"
    await submitLeave(selectedDates, leaveType, reason, dayDurations);
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
            color="text-blue-500"
          />
          <LeaveCard
            title="CASUAL & SICK LEAVE"
            total={leaves.casualSickLeave.total}
            available={leaves.casualSickLeave.available}
            color="text-cyan-500"
          />
        </div>

        {/* --- Main layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
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
              setLeaveType={handleLeaveTypeChange}
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
        onApplyLeave={handleApplyLeaveFromModal}
      />
    </div>
  );
};

export default CalendarLeave;
