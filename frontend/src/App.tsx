import { useEffect } from "react";
import { useAuth } from "./context/auth-context";
import AppRoutes from "./routes";

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <AppRoutes />;
}

export default App;
