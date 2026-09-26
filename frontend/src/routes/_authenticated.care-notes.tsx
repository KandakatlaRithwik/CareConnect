import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NotebookPen, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { careNotesApi, patientsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/care-notes")({
  component: CareNotesPage,
});

function CareNotesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: notes = [], isLoading } = useQuery({ queryKey: ["notes"], queryFn: () => careNotesApi.list().catch(() => []) });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list().catch(() => []) });

  const create = useMutation({
    mutationFn: (d: any) => careNotesApi.create(d),
    onSuccess: () => { toast.success("Note added"); qc.invalidateQueries({ queryKey: ["notes"] }); setOpen(false); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed")),
  });

  return (
    <div>
      <PageHeader eyebrow="Journal" title="Care notes" description="A running timeline of caregiver observations, vitals and daily progress."
        actions={<button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary"><Plus className="h-4 w-4" /> New note</button>} />

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : !notes.length ? <EmptyState icon={NotebookPen} title="No care notes yet" description="Caregivers can log observations from each visit here." />
      : (
        <ol className="relative space-y-4 border-l-2 border-primary/20 pl-6">
          {notes.map((n: any) => (
            <li key={n._id} className="relative">
              <span className="absolute -left-[29px] top-2 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary shadow-primary" />
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{new Date(n.createdAt ?? Date.now()).toLocaleString()}</p>
                    <p className="mt-1 font-semibold">{n.patient?.name ?? "Patient"} · {n.type ?? "Observation"}</p>
                  </div>
                  <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-medium text-secondary">{n.caregiver?.name ?? "Caregiver"}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{n.note ?? n.content ?? n.description}</p>
                {n.vitals && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {Object.entries(n.vitals).map(([k, v]) => (
                      <span key={k} className="rounded-md bg-muted px-2 py-1">{k}: <strong>{String(v)}</strong></span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
            <h2 className="text-xl font-semibold">New care note</h2>
            <form className="mt-4 space-y-3" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                bookingId: fd.get("bookingId"),
                notes: fd.get("note"),
              });
            }}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Patient</span>
                <select name="bookingId" required className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm">
                  <option value="">— select —</option>
                  {patients.map((p: any) => <option key={p._id} value={p.bookingId}>{p.patientName}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Type</span>
                <select name="type" className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm">
                  {["Observation","Vitals","Incident","Medication","General"].map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Note</span>
                <textarea name="note" rows={4} required className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border px-4 text-sm">Cancel</button>
                <button disabled={create.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
