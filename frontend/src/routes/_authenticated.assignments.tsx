import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ClipboardList, CheckCircle2, XCircle, Clock, Loader2, MapPin, User2, CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { bookingsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/assignments")({
  component: AssignmentsPage,
});

const TABS = ["Pending", "Accepted", "Completed", "Rejected", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

function AssignmentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("Pending");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => bookingsApi.list().catch(() => []),
  });

  const setStatus = useMutation({
    mutationFn: (payload: any) => bookingsApi.updateStatus(payload),
    onSuccess: () => {
      toast.success("Booking updated");
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed to update")),
  });

  const grouped = useMemo(() => {
    const buckets: Record<Tab, any[]> = { Pending: [], Accepted: [], Completed: [], Rejected: [], Cancelled: [] };
    for (const b of bookings) {
      const s = (b.status ?? "Pending") as Tab;
      (buckets[s] ?? buckets.Pending).push(b);
    }
    return buckets;
  }, [bookings]);

  const list = grouped[tab] ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Caregiver console"
        title="My Assignments"
        description="Review incoming visit requests, accept the ones you can take, and keep families updated."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = grouped[t]?.length ?? 0;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !list.length ? (
        <EmptyState
          icon={ClipboardList}
          title={`No ${tab.toLowerCase()} assignments`}
          description={
            tab === "Pending"
              ? "New requests from families will show up here in real time."
              : "Nothing to show yet in this bucket."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((b: any) => (
            <div key={b._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {b.serviceId?.serviceName ?? b.serviceType ?? "Care visit"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <User2 className="h-3.5 w-3.5" /> {b.patientId?.patientName ?? "Patient"}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" />
                  {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                  {b.startTime && ` · ${b.startTime}`}
                  {b.endTime && ` – ${b.endTime}`}
                </p>
                {b.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                    {typeof b.address === "string" ? b.address : b.address?.line1 ?? "On location"}
                  </p>
                )}
              </div>

              {b.notes && (
                <p className="mt-3 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                  {b.notes}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {tab === "Pending" && (
                  <>
                    <button
                      disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ id: b._id, bookingId: b._id, status: "Accepted" })}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-primary"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ id: b._id, bookingId: b._id, status: "Rejected", reason: "Not available" })}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Decline
                    </button>
                  </>
                )}
                {tab === "Accepted" && (
                  <button
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: b._id, bookingId: b._id, status: "Completed" })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { icon: any; tone: string }> = {
    Pending: { icon: Clock, tone: "warning" },
    Accepted: { icon: CheckCircle2, tone: "primary" },
    Completed: { icon: CheckCircle2, tone: "success" },
    Rejected: { icon: XCircle, tone: "destructive" },
    Cancelled: { icon: XCircle, tone: "destructive" },
  };
  const s = status ?? "Pending";
  const { icon: Icon, tone } = map[s] ?? map.Pending;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `var(--color-${tone}-soft, var(--color-muted))`, color: `var(--color-${tone})` }}
    >
      <Icon className="h-3 w-3" /> {s}
    </span>
  );
}
