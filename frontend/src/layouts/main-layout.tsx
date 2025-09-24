import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Outlet } from "react-router";
import { Fragment, useState, type Dispatch, type SetStateAction } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/sonner";

export type OutletContextType = {
  setBreadcrumb: Dispatch<SetStateAction<string[]>>;
};

const MainLayout = () => {
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {/* <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem> */}

                  {breadcrumb.map((item, index) => (
                    <Fragment key={index}>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{item}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="p-5">
            <Outlet context={{ setBreadcrumb }} />
            <Toaster richColors />
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default MainLayout;
