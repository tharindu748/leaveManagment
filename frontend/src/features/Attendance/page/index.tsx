import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import { Button } from "@/components/ui/button";
import { DataTable2 } from "@/components/data-table";
import { columns, type Punches } from "../components/columns";
import api from "@/api/axios";

function PunchesPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Punches[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const fetchPunches = async () => {
    try {
      const res = await api.get(`/punches/latest`);
      setData(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const startPolling = async () => {
    try {
      const res = await api.post(`/device/start-polling`);
      setIsPolling(true);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const stopPolling = async () => {
    try {
      const res = await api.post(`/device/stop-polling`);
      setIsPolling(false);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Punches"]);
    fetchPunches();
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Punches" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Status</h2>
        </div>
        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Latest Punches</h2>
          <DataTable2 columns={columns} data={data} />
        </div>
        <div className="flex items-end space-x-4 mt-3">
          <Button
            onClick={() => startPolling()}
            type="button"
            className="bg-green-600"
            disabled={isPolling}
          >
            Start Polling
          </Button>
          <Button
            onClick={() => stopPolling()}
            type="button"
            className="bg-red-600"
            disabled={!isPolling}
          >
            Stop Polling
          </Button>
          <Button
            onClick={() => fetchPunches()}
            type="button"
            className="bg-blue-600"
            disabled={!isPolling}
          >
            Refresh Table
          </Button>
        </div>
      </div>
    </>
  );
}

export default PunchesPage;
