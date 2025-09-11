import { Button } from "@/components/ui/button";
import type { OutletContextType } from "@/layouts/main-layout";
import { CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { DataTable } from "@/components/data-table";
import { columns, type Calculate } from "../components/columns";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";

async function getData(): Promise<Calculate[]> {
  return [
    {
      Date: "2025-09-01",
      StartTime: "08:00",
      LastOut: "16:30",
      WorkHours: "27000",
      NotWorkHours: "9000",
      OverTime: "4000",
    },
    {
      Date: "2025-09-02",
      StartTime: "08:00",
      LastOut: "16:30",
      WorkHours: "27000",
      NotWorkHours: "9000",
      OverTime: "4000",
    },
    {
      Date: "2025-09-03",
      StartTime: "08:00",
      LastOut: "16:30",
      WorkHours: "27000",
      NotWorkHours: "9000",
      OverTime: "4000",
    },
    {
      Date: "2025-09-04",
      StartTime: "08:00",
      LastOut: "16:30",
      WorkHours: "27000",
      NotWorkHours: "9000",
      OverTime: "4000",
    },
  ];
}

function ActivityPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Calculate[]>([]);

  useEffect(() => {
    setBreadcrumb(["Activity"]);

    getData().then((res) => {
      setData(res);
    });
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
