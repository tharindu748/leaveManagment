import { DataTable } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react"; 
import { useOutletContext } from "react-router";
import api from "@/api/axios";
import { columns, type Employee } from "../components/columns";
import EditUserDialog from "../components/edit-user-dialog";
import { toast } from "sonner";

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
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to fetch users");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditUserToggle(true);
  };

  useEffect(() => {
    setBreadcrumb(["Users"]);
    fetchUsers();
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Users" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
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
