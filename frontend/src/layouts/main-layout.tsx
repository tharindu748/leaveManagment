import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger />
            </div>
          </header>

          <div className="p-5">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default MainLayout;
