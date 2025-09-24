import { useAuth } from "@/context/auth-context";
import AdminDashboard from "./admin-dashboard";
import EmployeeDashboard from "./employee-dashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  return (
    <>
      <div className="">
        {isAdmin && isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
      </div>
    </>
  );
};

export default Dashboard;
