import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Stethoscope, Star, MapPin, BadgeCheck, Search } from "lucide-react";
import { caregiversApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { BookingModal } from "@/components/BookingModal";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/caregivers")({
  component: CaregiversPage,
});

function CaregiversPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const { data = [] } = useQuery({
    queryKey: ["caregivers", spec],
    queryFn: () => caregiversApi.list(spec ? { specialization: spec } : undefined).catch(() => []),
  });

  const filtered = data.filter((c: any) =>
    !q || c.userId?.name?.toLowerCase().includes(q.toLowerCase()) || c.caregiverType?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader eyebrow="Care Network" title="Find caregivers"
        description="Verified nurses, physiotherapists and elderly-care specialists ready to visit." />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or specialty"
            className="h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={spec} onChange={(e) => setSpec(e.target.value)}
          className="h-11 rounded-lg border border-input bg-surface px-3 text-sm">
          <option value="">All specializations</option>
          <option value="Nurse">Nurse</option>
          <option value="Physiotherapist">Physiotherapist</option>
          <option value="Elderly Care">Elderly Care</option>
          <option value="Dementia Care">Dementia Care</option>
        </select>
      </div>

      {!filtered.length ? (
        <EmptyState icon={Stethoscope} title="No caregivers found" description="Try broadening your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <div key={c._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-soft text-secondary text-lg font-semibold">
                  {c.userId?.name?.[0]?.toUpperCase() ?? "C"}
                  {c.isVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card text-primary" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{c.userId?.name ?? c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.caregiverType ?? "Caregiver"}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.location ?? c.city ?? "Available near you"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-warning">
                  <Star className="h-3.5 w-3.5 fill-current" /> {c.rating?.toFixed?.(1) ?? "4.8"}
                </span>
                <span className="text-muted-foreground">{c.experienceYears ?? 3}+ yrs exp</span>
                <span className="ml-auto font-semibold text-primary">₹{c.hourlyRate ?? 300}/hr</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setSelectedCaregiver(c)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-semibold text-primary-foreground">
                  Book
                </button>
                <button 
                  onClick={() => toast.info(`Viewing profile for ${c.userId?.name ?? c.name}`)}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors">
                  Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingModal 
        isOpen={!!selectedCaregiver} 
        onClose={() => setSelectedCaregiver(null)} 
        caregiver={selectedCaregiver} 
      />
    </div>
  );
}
