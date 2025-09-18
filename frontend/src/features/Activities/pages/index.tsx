import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { DataTable } from "@/components/data-table";
import { columns, type Calculate } from "../components/table/columns";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import api from "@/api/axios";
import { useAuth } from "@/context/auth-context";

function ActivityPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const { user } = useAuth();
  const [data, setData] = useState<Calculate[]>([]);

  const employeeId = user?.employeeId;

  const fetchActivity = async () => {
    try {
      const res = await api.get(`/attendance/recalc-all-days/${employeeId}`);
      setData(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Activity"]);
    fetchActivity();
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Activity" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}

export default ActivityPage;
