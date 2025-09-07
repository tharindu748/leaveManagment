import { Route, Routes } from "react-router";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/main-layout";
import Dashboard from "@/features/dashboard/pages";
import ProtectedRoute from "./protected-route";
import PublicRoute from "./public-route";
import Login from "@/features/auth/pages";
import CalendarLeave from "@/features/calendar/pages";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/" element={<Home />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarLeave />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
