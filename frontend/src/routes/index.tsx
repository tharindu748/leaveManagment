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
import PunchesPage from "@/features/Attendance/page/punches-page";
import UsersPage1 from "@/features/users/pages";
import DeviceConfigPage from "@/features/settings/pages";
import TimeConfigPage from "@/features/settings/pages/time-config-page";
import LeaveManagementPage from "@/features/Attendance/page/leave-manage-page";
import UserPunchesPage from "@/features/Activities/pages/user-punches";
import TimeCalcPage from "@/features/Attendance/page/times-page";
import LeavePolicyPage from "@/features/settings/pages/leave-policy-page";

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
          <Route path="/activity/times" element={<ActivityPage />} />
          <Route path="/activity/punches" element={<UserPunchesPage />} />
          <Route path="/attendance/punches" element={<PunchesPage />} />
          <Route
            path="/attendance/leave-management"
            element={<LeaveManagementPage />}
          />
          <Route path="/attendance/times" element={<TimeCalcPage />} />
          <Route path="/users1" element={<UsersPage1 />} />
          <Route path="/device-config" element={<DeviceConfigPage />} />
          <Route path="/time-config" element={<TimeConfigPage />} />
          <Route path="/leave-policy" element={<LeavePolicyPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
