import { useAuth } from "@/context/auth-context";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in.</div>;
  }

  console.log(user);
  return (
    <div>
      <h1>Welcome to the Dashboard, {user?.email}!</h1>
      <p>Your User ID is: {user?.id}</p>
      <p>Your User ID is: {user?.name}</p>
      <p>Is Admin {user?.isAdmin ? "Yes" : "No"}</p>
    </div>
  );
};

export default Dashboard;
