import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect } from "react";
import { useOutletContext } from "react-router";

function TimeCalcPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();

  useEffect(() => {
    setBreadcrumb(["Attendance", "Timing"]);
  }, []);
  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Timing" />
        </div>
      </PageHeader>
    </>
  );
}

export default TimeCalcPage;
