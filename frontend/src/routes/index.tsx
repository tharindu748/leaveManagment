import { Route, Routes } from "react-router";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/main-layout";
import Dashboard from "@/features/dashboard/pages";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
