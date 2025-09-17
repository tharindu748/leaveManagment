import { DataTable } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import { Button } from "@/components/ui/button";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import api from "@/api/axios";
import { columns, type Employee } from "../components/columns";

function UsersPage1() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Employee[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users`);
      setData(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const syncUsers = async () => {
    try {
      const res = await api.post(`/device/sync-users`);
      fetchUsers();
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Users1"]);
    fetchUsers();
  }, []);
  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Users1" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="flex items-end space-x-4 mt-3">
          <Button
            onClick={() => syncUsers()}
            type="button"
            className="bg-green-600"
            // disabled
          >
            Sync Users
          </Button>
          <Button type="button" className="bg-blue-600" disabled>
            Edit User
          </Button>
        </div>
        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Registered Users</h2>
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </>
  );
}
export default UsersPage1;
