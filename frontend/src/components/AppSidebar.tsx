import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Stethoscope, CalendarClock, Pill, NotebookPen,
  FileText, Bell, ShieldAlert, Star, User, LogOut, HeartPulse, Sparkles,
  ClipboardList, UserCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

// Family / Patient dashboard: book care, manage loved ones
const familyNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/patients", icon: Users },
  { title: "Find Caregivers", url: "/caregivers", icon: Stethoscope },
  { title: "Bookings", url: "/bookings", icon: CalendarClock },
];

// Caregiver dashboard: accept jobs, care for assigned patients
const caregiverNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Assignments", url: "/assignments", icon: ClipboardList },
  { title: "My Patients", url: "/patients", icon: UserCheck },
  { title: "Care Notes", url: "/care-notes", icon: NotebookPen },
  { title: "Medications", url: "/medications", icon: Pill },
  { title: "Emergency SOS", url: "/sos", icon: ShieldAlert },
];

const alertsNav = [
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");
  const isCaregiver = user?.role === "Caregiver";
  const primaryNav = isCaregiver ? caregiverNav : familyNav;
  const groupLabel = isCaregiver ? "Practice" : "Care";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
            <HeartPulse className="h-5 w-5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">CareConnect</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {isCaregiver ? "Caregiver Console" : "Elderly Care Suite"}
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Alerts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {alertsNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip="Profile">
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {!collapsed && <span>Profile</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-2 rounded-lg bg-sidebar-accent/60 p-2.5">
            <p className="truncate text-xs font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.role}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout().then(() => (window.location.href = "/"))}
              tooltip="Sign out"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarTip() {
  return (
    <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      Tip: press <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">⌘/</kbd> to search
    </div>
  );
}
