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
  LayoutDashboard,
  Activity,
  UserCheck,
  User,
  Settings,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/context/auth-context";

type VisibleFor = "admin" | "user" | "all";

interface MenuItem {
  title: string;
  icon?: any;
  url: string;
  items?: MenuItem[];
  visibleFor: VisibleFor;
  isActive?: boolean;
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    items: [],
    visibleFor: "all",
  },
  {
    title: "Go To Calendar",
    icon: Calendar,
    url: "/calendar",
    items: [],
    visibleFor: "user",
  },
  {
    title: "Activity",
    icon: Activity,
    url: "#",
    visibleFor: "user",
    items: [
      {
        title: "Punches",
        url: "/activity/punches",
        visibleFor: "user",
      },
      {
        title: "Timing",
        url: "/activity/times",
        visibleFor: "user",
      },
    ],
  },
  {
    title: "Attendance",
    icon: UserCheck,
    url: "#",
    visibleFor: "admin",
    items: [
      {
        title: "Punches",
        url: "/attendance/punches",
        visibleFor: "admin",
      },
      {
        title: "Leave Management",
        url: "/attendance/leave-management",
        visibleFor: "admin",
      },
      {
        title: "Timing",
        url: "/attendance/times",
        visibleFor: "admin",
      },
    ],
  },
  {
    title: "User Management",
    icon: User,
    url: "#",
    visibleFor: "admin",
    items: [
      {
        title: "Users",
        url: "/users1",
        visibleFor: "admin",
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
    visibleFor: "admin",
    items: [
      {
        title: "Device Configuration",
        url: "/device-config",
        visibleFor: "admin",
      },
      {
        title: "Time Configuration",
        url: "/time-config",
        visibleFor: "admin",
      },
      {
        title: "Leave Policy",
        url: "/leave-policy",
        visibleFor: "admin",
      },
    ],
  },
];

const canSee = (visibleFor: VisibleFor, isAdmin?: boolean) => {
  if (visibleFor === "all") return true;
  if (visibleFor === "admin" && isAdmin) return true;
  if (visibleFor === "user" && !isAdmin) return true;
  return false;
};

function MainNav() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items
          .filter((item) => canSee(item.visibleFor, isAdmin))
          .map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items && item.items.length > 0 ? (
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
                        {item.items
                          .filter((subItem) =>
                            canSee(subItem.visibleFor, isAdmin)
                          )
                          .map((subItem) => (
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
