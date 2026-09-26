import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pill, Plus, Trash2, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { medicationsApi, patientsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/medications")({
  component: MedicationsPage,
});

function MedicationsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useQuery({ queryKey: ["meds"], queryFn: () => medicationsApi.list().catch(() => []) });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list().catch(() => []) });

  const add = useMutation({
    mutationFn: (d: any) => medicationsApi.add(d),
    onSuccess: () => { toast.success("Medication added"); qc.invalidateQueries({ queryKey: ["meds"] }); setOpen(false); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => medicationsApi.remove(id),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["meds"] }); },
  });

  return (
    <div>
      <PageHeader eyebrow="Regimen" title="Medications" description="Track prescriptions, dosage schedules and reminders for every patient."
        actions={<button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary"><Plus className="h-4 w-4" /> Add medication</button>} />

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : !data.length ? <EmptyState icon={Pill} title="No medications tracked" description="Add prescriptions to enable dosage reminders." />
      : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((m: any) => (
            <div key={m._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Pill className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{m.medicineName}</p>
                    <p className="text-xs text-muted-foreground">{m.dosage} · {m.frequency}</p>
                  </div>
                </div>
                <button onClick={() => remove.mutate(m._id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <p className="text-muted-foreground">Patient: <span className="text-foreground">{m.patientId?.patientName ?? "—"}</span></p>
                {m.reminderTime?.length ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.reminderTime.map((t: string) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                        <Clock className="h-3 w-3" /> {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                {m.notes && <p className="pt-1 text-xs text-muted-foreground">{m.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
            <h2 className="text-xl font-semibold">Add medication</h2>
            <form className="mt-4 space-y-3" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              add.mutate({
                patientId: fd.get("patient"),
                medicineName: fd.get("name"),
                dosage: fd.get("dosage"),
                frequency: fd.get("frequency"),
                reminderTime: String(fd.get("times") || "").split(",").map(s => s.trim()).filter(Boolean),
                notes: fd.get("notes"),
              });
            }}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Patient</span>
                <select name="patient" required className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm">
                  <option value="">— select —</option>
                  {patients.map((p: any) => <option key={p._id} value={p._id}>{p.patientName}</option>)}
                </select>
              </label>
              {[
                { n: "name", l: "Medication name", req: true },
                { n: "dosage", l: "Dosage (e.g. 500mg)" },
              ].map((f) => (
                <label key={f.n} className="block">
                  <span className="mb-1 block text-sm font-medium">{f.l}</span>
                  <input name={f.n} required={f.req} className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Frequency</span>
                <select name="frequency" required className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm">
                  <option value="OnceDaily">Once Daily</option>
                  <option value="TwiceDaily">Twice Daily</option>
                  <option value="ThriceDaily">Thrice Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="AsNeeded">As Needed</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Times (comma separated, e.g. 08:00, 20:00)</span>
                <input name="times" className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Notes</span>
                <textarea name="notes" rows={2} className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border px-4 text-sm">Cancel</button>
                <button disabled={add.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
