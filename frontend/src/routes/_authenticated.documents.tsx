import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileText, Upload, Loader2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { documentsApi, patientsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [patient, setPatient] = useState("");
  const [type, setType] = useState("Prescription");

  const { data = [], isLoading } = useQuery({ queryKey: ["docs"], queryFn: () => documentsApi.list().catch(() => []) });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list().catch(() => []) });

  const upload = useMutation({
    mutationFn: (fd: FormData) => documentsApi.upload(fd),
    onSuccess: () => { toast.success("Uploaded"); qc.invalidateQueries({ queryKey: ["docs"] }); },
    onError: (e) => toast.error(extractErrorMessage(e, "Upload failed")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["docs"] }); },
  });

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!patient) return toast.error("Select a patient first");
    const fd = new FormData();
    fd.append("file", files[0]);
    fd.append("patient", patient);
    fd.append("type", type);
    upload.mutate(fd);
  }

  return (
    <div>
      <PageHeader eyebrow="Records" title="Medical documents" description="Store prescriptions, discharge summaries, lab reports and insurance papers securely." />

      <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-card md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Patient</span>
          <select value={patient} onChange={(e) => setPatient(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm">
            <option value="">— select —</option>
            {patients.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm">
            {["Prescription","Lab Report","Discharge Summary","Insurance","Other"].map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <div className="self-end">
          <input ref={inputRef} type="file" hidden onChange={(e) => handleFiles(e.target.files)} />
          <button onClick={() => inputRef.current?.click()} disabled={upload.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-primary">
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
        </div>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : !data.length ? <EmptyState icon={FileText} title="No documents" description="Upload medical records to keep them handy for every caregiver." />
      : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((d: any) => (
            <div key={d._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
                <button onClick={() => remove.mutate(d._id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 truncate font-semibold">{d.name ?? d.originalName ?? "Document"}</p>
              <p className="text-xs text-muted-foreground">{d.type} · {d.patient?.name ?? "—"}</p>
              <a href={d.url ?? d.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Open <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
