import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock, Plus, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { bookingsApi, caregiversApi, patientsApi, servicesApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/bookings")({
  component: BookingsPage,
});

const statusIcon: Record<string, any> = {
  Confirmed: CheckCircle2, Completed: CheckCircle2, Cancelled: XCircle, Pending: Clock,
};

function BookingsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: bookings = [], isLoading } = useQuery({ queryKey: ["bookings"], queryFn: () => bookingsApi.list().catch(() => []) });
  const { data: caregivers = [] } = useQuery({ queryKey: ["caregivers"], queryFn: () => caregiversApi.list().catch(() => []) });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list().catch(() => []) });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list().catch(() => []) });

  const create = useMutation({
    mutationFn: (d: any) => bookingsApi.create(d),
    onSuccess: () => { toast.success("Booking requested"); qc.invalidateQueries({ queryKey: ["bookings"] }); setOpen(false); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed to book")),
  });
  const setStatus = useMutation({
    mutationFn: (d: any) => bookingsApi.updateStatus(d),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["bookings"] }); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed")),
  });

  return (
    <div>
      <PageHeader eyebrow="Schedule" title="Bookings" description="Track visits, request new appointments and manage status in one timeline."
        actions={<button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary"><Plus className="h-4 w-4" /> New booking</button>} />

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : !bookings.length ? <EmptyState icon={CalendarClock} title="No bookings yet" description="Request your first caregiver visit." />
      : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Caregiver</th>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b: any) => {
                const Icon = statusIcon[b.status] ?? Clock;
                return (
                  <tr key={b._id} className="hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium">{b.serviceId?.serviceName ?? b.serviceType ?? "Care visit"}</td>
                    <td className="px-5 py-4">{b.patientId?.patientName ?? "—"}</td>
                    <td className="px-5 py-4">{b.caregiverId?.userId?.name ?? b.caregiverId?.name ?? "Unassigned"}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                      {b.startTime && ` · ${b.startTime}`}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                        <Icon className="h-3.5 w-3.5" /> {b.status ?? "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select defaultValue={b.status ?? "Pending"} onChange={(e) => setStatus.mutate({ id: b._id, bookingId: b._id, status: e.target.value })}
                        className="rounded-md border border-input bg-surface px-2 py-1 text-xs">
                        {["Pending","Confirmed","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
            <h2 className="text-xl font-semibold">New booking</h2>
            <form className="mt-4 space-y-3" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                patientId: fd.get("patient"),
                caregiverId: fd.get("caregiver"),
                serviceId: fd.get("service") || undefined,
                bookingDate: fd.get("startDate")?.toString().split("T")[0] || "",
                startTime: fd.get("startDate")?.toString().split("T")[1] || "",
                endTime: fd.get("endDate")?.toString().split("T")[1] || "",
                bookingType: "Hourly",
              });
            }}>
              <Select name="patient" label="Patient" required options={patients.map((p: any) => ({ value: p._id, label: p.patientName }))} />
              <Select name="caregiver" label="Caregiver" required options={caregivers.map((c: any) => ({ value: c._id, label: `${c.userId?.name ?? c.name} — ${c.specialization ?? ""}` }))} />
              <Select name="service" label="Service" options={services.map((s: any) => ({ value: s._id, label: s.serviceName }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input name="startDate" type="datetime-local" label="Start" required />
                <Input name="endDate" type="datetime-local" label="End" />
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Notes</span>
                <textarea name="notes" rows={3} className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border px-4 text-sm">Cancel</button>
                <button disabled={create.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ name, label, type = "text", required }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} type={type} required={required} className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}
function Select({ name, label, options, required }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select name={name} required={required} className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm">
        <option value="">— select —</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
