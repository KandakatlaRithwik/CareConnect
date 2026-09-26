import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ShieldAlert, Phone, MapPin, Loader2, CheckCircle2, Siren } from "lucide-react";
import { toast } from "sonner";
import { sosApi, patientsApi } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

function SOSPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [patient, setPatient] = useState("");
  const [message, setMessage] = useState("Fall");
  const { data = [] } = useQuery({ queryKey: ["sos"], queryFn: () => sosApi.list().catch(() => []) });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list().catch(() => []) });

  const trigger = useMutation({
    mutationFn: (d: any) => sosApi.trigger(d),
    onSuccess: () => { toast.success("Emergency team alerted"); qc.invalidateQueries({ queryKey: ["sos"] }); setMessage(""); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed to trigger SOS")),
  });
  const resolve = useMutation({
    mutationFn: (id: string) => sosApi.resolve(id),
    onSuccess: () => { toast.success("Marked resolved"); qc.invalidateQueries({ queryKey: ["sos"] }); },
  });

  function fire() {
    if (!patient) return toast.error("Select a patient");
    navigator.geolocation?.getCurrentPosition(
      (pos) => trigger.mutate({ patientId: patient, emergencyType: message, location: { address: `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}` } }),
      () => trigger.mutate({ patientId: patient, emergencyType: message }),
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Critical" title="Emergency SOS" description="One tap alerts the on-call caregiver, emergency contacts and CareConnect's 24/7 response desk." />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-destructive/20 bg-gradient-to-br from-destructive/10 via-card to-card p-8 shadow-elevated">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-destructive/10 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-destructive">
            <Siren className="h-3.5 w-3.5" /> Emergency channel
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Trigger an SOS alert</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            We'll share the patient's location with the assigned caregiver and dispatch nearby responders.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Patient</span>
              <select value={patient} onChange={(e) => setPatient(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm">
                <option value="">— select —</option>
                {patients.map((p: any) => <option key={p._id} value={p._id}>{p.patientName}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Emergency Type</span>
              <select value={message} onChange={(e) => setMessage(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm">
                <option value="Fall">Fall</option>
                <option value="ChestPain">Chest Pain</option>
                <option value="BreathingDifficulty">Breathing Difficulty</option>
                <option value="Unconscious">Unconscious</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <button onClick={fire} disabled={trigger.isPending}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-destructive text-base font-bold text-destructive-foreground shadow-elevated hover:brightness-110 disabled:opacity-70">
            {trigger.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
            SEND SOS ALERT
          </button>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> 24/7 dispatch: 1800-CARECONNECT</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Location auto-shared</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold">Recent alerts</h3>
          <ul className="mt-4 space-y-3">
            {!data.length && <p className="text-sm text-muted-foreground">No emergencies logged. Stay safe.</p>}
            {data.map((s: any) => (
              <li key={s._id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{s.patientId?.patientName ?? "Patient"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.createdAt ?? Date.now()).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.status === "Resolved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {s.status ?? "Active"}
                  </span>
                </div>
                <p className="mt-2 text-sm">{s.emergencyType ?? "—"}</p>
                {s.location?.address && <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {s.location.address}</p>}
                {s.triggeredBy?.name && <p className="mt-2 text-xs text-muted-foreground">Alert raised by {s.triggeredBy.name} ({s.triggeredBy.role})</p>}
                {user?.role === "Admin" && s.status !== "Resolved" && (
                  <button onClick={() => resolve.mutate(s._id)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-success hover:underline">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
