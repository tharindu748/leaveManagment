import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import AdminCalendar from "../components/admin-calendar";
import { DataTable } from "@/components/data-table";
import {
  leaveManageColumns,
  type LeaveRequest,
} from "../components/Table/leave-manage-column";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function LeaveManagementPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [calendarToggle, setCalendarToggle] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id;

  const fetchLeaveRequest = async () => {
    try {
      const res = await api.get(`/leave/requests`);
      setData(res.data);
      console.log(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch leave requests"
      );
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await api.post(`/leave/approve`, {
        requestId,
        approvedBy: currentUserId,
      });
      fetchLeaveRequest();
      toast.success("Request approved successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to approve request"
      );
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await api.post(`/leave/cancel`, {
        requestId,
        approvedBy: currentUserId,
      });
      fetchLeaveRequest();
      toast.success("Request cancelled successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel request");
    }
  };

  useEffect(() => {
    setBreadcrumb(["Attendance", "Leave Management"]);
    fetchLeaveRequest();
  }, []);
  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Leave Management" />
        </div>
      </PageHeader>
      <div className="rounded-lg border p-6">
        <Button onClick={() => setCalendarToggle(true)}>View calendar</Button>

        <DataTable
          columns={leaveManageColumns(handleApprove, handleCancel)}
          data={data}
        />
      </div>
      {calendarToggle && (
        <AdminCalendar open={calendarToggle} onOpenChange={setCalendarToggle} />
      )}
    </>
  );
}

export default LeaveManagementPage;
