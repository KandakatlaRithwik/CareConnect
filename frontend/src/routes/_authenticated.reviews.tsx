import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { caregiversApi, reviewsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const qc = useQueryClient();
  const [caregiverId, setCaregiverId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: caregivers = [] } = useQuery({ queryKey: ["caregivers"], queryFn: () => caregiversApi.list().catch(() => []) });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", caregiverId],
    queryFn: () => caregiverId ? reviewsApi.forCaregiver(caregiverId).catch(() => []) : Promise.resolve([]),
    enabled: !!caregiverId,
  });

  const submit = useMutation({
    mutationFn: () => reviewsApi.create({ caregiver: caregiverId, rating, comment }),
    onSuccess: () => { toast.success("Review posted"); setComment(""); qc.invalidateQueries({ queryKey: ["reviews", caregiverId] }); },
    onError: (e) => toast.error(extractErrorMessage(e, "Failed")),
  });

  return (
    <div>
      <PageHeader eyebrow="Feedback" title="Reviews" description="Share how your caregivers are performing. Your feedback helps other families." />

      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <label className="block max-w-md">
          <span className="mb-1 block text-sm font-medium">Caregiver</span>
          <select value={caregiverId} onChange={(e) => setCaregiverId(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm">
            <option value="">— select a caregiver —</option>
            {caregivers.map((c: any) => <option key={c._id} value={c._id}>{c.name ?? c.user?.name}</option>)}
          </select>
        </label>

        {caregiverId && (
          <div className="mt-5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience…"
              className="mt-3 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm" rows={3} />
            <button onClick={() => submit.mutate()} disabled={submit.isPending || !comment}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post review
            </button>
          </div>
        )}
      </div>

      {caregiverId && !reviews.length ? (
        <EmptyState icon={Star} title="No reviews yet" description="Be the first to share feedback for this caregiver." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.user?.name ?? r.family?.name ?? "Family"}</p>
                <span className="flex items-center gap-0.5 text-warning">
                  {Array.from({ length: r.rating ?? 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </span>
              </div>
              <p className="mt-2 text-sm">{r.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt ?? Date.now()).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
