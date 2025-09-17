import { Route, Routes } from "react-router";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/main-layout";
import Dashboard from "@/features/dashboard/pages";
import ProtectedRoute from "./protected-route";
import PublicRoute from "./public-route";
import Login from "@/features/auth/pages";
import CalendarLeave from "@/features/calendar/pages";
import ActivityPage from "@/features/Activities/pages";
import PunchesPage from "@/features/Attendance/page";
import UsersPage1 from "@/features/users/pages";
import DeviceConfigPage from "@/features/settings/pages";

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
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/punches" element={<PunchesPage />} />
          <Route path="/users1" element={<UsersPage1 />} />
          <Route path="/device-config" element={<DeviceConfigPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
