import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { tokenStore } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, SidebarTip } from "@/components/AppSidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  const { isReady, isAuthenticated, user } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!tokenStore.access) {
      window.location.replace("/auth/login");
      return;
    }
    setChecked(true);
  }, []);

  if (!checked || !isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background bg-medcross">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border glass px-4">
            <SidebarTrigger />
            <div className="relative hidden flex-1 max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search patients, caregivers, bookings…"
                className="h-9 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
                onChange={(e) => window.dispatchEvent(new CustomEvent("cc:search", { detail: e.target.value }))}
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <SidebarTip />
              {user && (
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user.name?.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </span>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 bg-medcross p-6 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
