import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Stethoscope, CalendarClock, Pill, ShieldAlert, Activity,
  ArrowUpRight, HeartPulse, Bell, Search
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { patientsApi, caregiversApi, bookingsApi, medicationsApi, sosApi, notificationsApi } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function useSafe<T>(fn: () => Promise<T>, key: string, fallback: T) {
  return useQuery({ queryKey: [key], queryFn: () => fn().catch(() => fallback), staleTime: 30_000 });
}

function DashboardPage() {
  const { user } = useAuth();
  
  if (user?.role === "Caregiver") return <CaregiverDashboard />;
  return <PatientDashboard />;
}

// --------------------------------------------------------------------------
// PATIENT / FAMILY DASHBOARD
// --------------------------------------------------------------------------
function PatientDashboard() {
  const { user } = useAuth();
  const caregivers = useSafe(() => caregiversApi.list(), "caregivers", [] as any[]);
  const bookings = useSafe(() => bookingsApi.list(), "bookings", [] as any[]);
  const meds = useSafe(() => medicationsApi.list(), "meds", [] as any[]);
  const sos = useSafe(() => sosApi.list(), "sos", [] as any[]);

  return (
    <div>
      <PageHeader
        eyebrow="Patient Dashboard"
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Book caregivers, manage medications, and monitor health alerts."
        actions={
          <Link to="/caregivers" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary hover:-translate-y-0.5 transition-transform">
            <Search className="h-4 w-4" /> Find Caregiver
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bookings" value={bookings.data?.length ?? 0} icon={CalendarClock} tone="primary" href="/bookings" />
        <StatCard label="Available Caregivers" value={caregivers.data?.length ?? 0} icon={Stethoscope} tone="secondary" href="/caregivers" />
        <StatCard label="Medications" value={meds.data?.length ?? 0} icon={Pill} tone="accent" href="/medications" />
        <StatCard label="SOS Alerts" value={sos.data?.length ?? 0} icon={ShieldAlert} tone="destructive" href="/sos" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Upcoming Visits
            </h3>
            <Link to="/bookings" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {(bookings.data ?? []).slice(0, 5).map((b: any) => (
              <li key={b._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{b.service?.name || "Care visit"}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "—"} • {b.startTime}
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">{b.status}</span>
              </li>
            ))}
            {!bookings.data?.length && <p className="py-2 text-sm text-muted-foreground">No bookings yet.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-secondary" /> Suggested Caregivers
            </h3>
            <Link to="/caregivers" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
          </div>
          <ul className="divide-y divide-border">
            {(caregivers.data ?? []).slice(0, 3).map((c: any) => (
              <li key={c._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary-soft text-secondary flex items-center justify-center font-bold">
                    {c.userId?.name?.[0] ?? "C"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.userId?.name ?? "Caregiver"}</p>
                    <p className="text-xs text-muted-foreground">{c.caregiverType} • ₹{c.hourlyRate}/hr</p>
                  </div>
                </div>
                <Link to="/caregivers" className="text-xs font-medium text-primary hover:underline">Book</Link>
              </li>
            ))}
            {!caregivers.data?.length && <p className="py-2 text-sm text-muted-foreground">No caregivers available.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// CAREGIVER DASHBOARD
// --------------------------------------------------------------------------
function CaregiverDashboard() {
  const { user } = useAuth();
  const bookings = useSafe(() => bookingsApi.list(), "bookings", [] as any[]);
  const sos = useSafe(() => sosApi.list(), "sos", [] as any[]);
  
  const pendingCount = (bookings.data ?? []).filter((b: any) => b.status === "Pending").length;

  return (
    <div>
      <PageHeader
        eyebrow="Caregiver Dashboard"
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Review your pending requests, upcoming visits, and active patient alerts."
        actions={
          <Link to="/assignments" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary hover:-translate-y-0.5 transition-transform">
            <CalendarClock className="h-4 w-4" /> Review requests
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Assignments" value={bookings.data?.length ?? 0} icon={CalendarClock} tone="primary" href="/assignments" />
        <StatCard label="Pending Requests" value={pendingCount} icon={Bell} tone="warning" href="/assignments" />
        <StatCard label="SOS Alerts" value={sos.data?.length ?? 0} icon={ShieldAlert} tone="destructive" href="/sos" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
         <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" /> Today's Schedule
         </h3>
         <ul className="divide-y divide-border">
            {(bookings.data ?? []).filter((b:any) => b.status === "Accepted").slice(0, 5).map((b: any) => (
              <li key={b._id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{b.service?.name ?? "Service Visit"}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ""} at {b.startTime}
                  </p>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Confirmed</span>
              </li>
            ))}
            {!(bookings.data ?? []).filter((b:any) => b.status === "Accepted").length && (
              <p className="text-sm text-muted-foreground">No confirmed visits for today.</p>
            )}
         </ul>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// SHARED COMPONENTS
// --------------------------------------------------------------------------
function StatCard({ label, value, icon: Icon, tone, href }: any) {
  return (
    <Link to={href} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl`} style={{
          backgroundColor: `var(--color-${tone}-soft, var(--color-muted))`,
          color: `var(--color-${tone})`,
        }}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}
