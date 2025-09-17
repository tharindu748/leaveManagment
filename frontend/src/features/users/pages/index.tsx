import { DataTable } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import { Button } from "@/components/ui/button";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import api from "@/api/axios";
import { columns, type Employee } from "../components/columns";
import EditUserDialog from "../components/edit-user-dialog";

export type User = {
  id: string;
  name: string;
  email?: string;
  epfNo?: string;
  nic?: string;
  jobPosition?: string;
};

function UsersPage1() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Employee[]>([]);
  const [editUserToggle, setEditUserToggle] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const syncUsers = async () => {
    try {
      await api.post(`/device/sync-users`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditUserToggle(true);
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
          <Button onClick={syncUsers} type="button" className="bg-green-600">
            Sync Users
          </Button>
        </div>

        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Registered Users</h2>
          <DataTable columns={columns(handleEdit)} data={data} />
        </div>
      </div>

      {editUserToggle && selectedUser && (
        <EditUserDialog
          open={editUserToggle}
          onOpenChange={(v) => {
            setEditUserToggle(v);
            if (!v) setSelectedUser(null);
          }}
          onSaved={fetchUsers}
          user={selectedUser}
        />
      )}
    </>
  );
}

export default UsersPage1;
