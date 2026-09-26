import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { notificationsApi } from "@/api";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["notifs"], queryFn: () => notificationsApi.list().catch(() => []),
    refetchInterval: 20_000,
  });
  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAsRead(),
    onSuccess: () => { toast.success("Marked as read"); qc.invalidateQueries({ queryKey: ["notifs"] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifs"] }),
  });

  return (
    <div>
      <PageHeader eyebrow="Inbox" title="Notifications" description="Real-time alerts about bookings, medications, care notes and emergencies."
        actions={
          <button onClick={() => markAll.mutate()} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-sm font-medium">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        } />

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : !data.length ? <EmptyState icon={Bell} title="Inbox zero" description="You're all caught up." />
      : (
        <ul className="space-y-3">
          {data.map((n: any) => (
            <li key={n._id} className={`flex items-start gap-4 rounded-2xl border p-5 shadow-card ${n.isRead ? "bg-card border-border" : "bg-primary-soft/40 border-primary/20"}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Bell className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{n.title ?? n.type ?? "Notification"}</p>
                  <span className="text-xs text-muted-foreground">{new Date(n.createdAt ?? Date.now()).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message ?? n.body}</p>
              </div>
              <button onClick={() => remove.mutate(n._id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
