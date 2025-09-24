import { DataTable } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import { Button } from "@/components/ui/button";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState, useRef } from "react"; // Added useRef for consistency, though not strictly needed here
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
  const [deviceBlock, setDeviceBlock] = useState(false);

  // Add ref for deviceBlock (for future-proofing, though not used in conditions here)
  const deviceBlockRef = useRef(deviceBlock);

  // Update ref when state changes
  useEffect(() => {
    deviceBlockRef.current = deviceBlock;
  }, [deviceBlock]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users`);
      setData(res.data);
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to fetch users");
    }
  };

  const checkDeviceConnection = async () => {
    try {
      const res = await api.get("/device/auth-status");
      setDeviceBlock(res.data.blocked);
      console.log(res.data.blocked, "blocked");
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Failed to check device connection"
      );
    }
  };

  useEffect(() => {
    // Initial check
    checkDeviceConnection();

    // Set up interval once on mount
    const time = setInterval(() => {
      checkDeviceConnection();
    }, 5000);

    return () => clearInterval(time);
  }, []); // Added empty deps to run only on mount

  const syncUsers = async () => {
    try {
      await api.post(`/device/sync-users`);
      fetchUsers();
      toast.success("Users synced successfully");
    } catch (error: any) {
      toast.error(error.response.data.message || "Users synced successfully");
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
        <div className="flex items-center space-x-4 mt-3">
          <Button
            onClick={syncUsers}
            type="button"
            className="bg-green-600"
            disabled={deviceBlock}
          >
            Sync Users
          </Button>
          <h2 className="font-semibold">
            Device Connection:{" "}
            <span
              className={`${
                deviceBlock
                  ? "bg-red-200 border-red-600 text-red-600"
                  : "bg-green-200 border-green-600 text-green-600 "
              }   border font-light pt-1 pb-2 px-3 rounded-sm`}
            >
              {deviceBlock ? "Disconnected " : "Connected"}{" "}
            </span>
          </h2>
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
