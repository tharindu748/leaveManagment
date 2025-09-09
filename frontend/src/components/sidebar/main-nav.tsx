import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Calendar,
  ChevronRight,
  FileType2,
  LayoutDashboard,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router";

const items = [
  {
    title: "Dashboard",
    isActive: false,
    icon: LayoutDashboard,
    url: "/dashboard",
    items: [],
  },
  {
    title: "Go To Calendar",
    isActive: false,
    icon: Calendar,
    url: "/calendar",
    items: [],
  },
  {
    title: "Attendance",
    isActive: false,
    icon: UserCheck,
    url: "#",
    items: [
      {
        title: "Attendance",
        isActive: false,
        url: "/attendance",
      },
      {
        title: "Results",
        isActive: false,
        url: "/results",
      },
    ],
  },
];

function MainNav() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.icon && <item.icon />}
                      <span className="whitespace-nowrap">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton>
                  {item.icon && <item.icon />}
                  <Link className="w-full whitespace-nowrap" to={item.url}>
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default MainNav;
